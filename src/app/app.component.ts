import {Component, HostListener, NgZone, ViewChild} from '@angular/core';
import { ElectronService } from 'ngx-electron';
import {Project} from './classes/Project';
import {Workspace} from './classes/Workspace';
import {Title} from '@angular/platform-browser';
import {SidebarSelection} from './components/sidebar/sidebar.component';
import {Pynq, ConnectionStatus} from './classes/Pynq';
import {ModalTemplate, SuiModalService, TemplateModalConfig} from 'ng2-semantic-ui';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  StatusType = ConnectionStatus;

  darkTheme = Workspace.darkMode;
  project: Project = null;
  activeSelection: SidebarSelection = null;

  editorFilename: string = null;
  editorOriginalContents: string = '';
  editorContents: string = '';

  openModal_newProject = false;
  openModal_newFile = false;
  openModal_newConnection = false;

  newFileModal_dirname = null;
  newFileModal_category = null;
  newFileModal_placeholder = null;

  statusText = '';
  progressBar = null;

  @ViewChild('simpleAlertModal')
  public simpleAlertModal:ModalTemplate<any, void, void>;


  constructor(private electron: ElectronService,
              private ngZone: NgZone,
              private titleService: Title,
              private modalService: SuiModalService,
              private pynq: Pynq) {}

  alert(title: string, message: string) {
    const config = new TemplateModalConfig(this.simpleAlertModal);
    config.context = {title: title, message: message};
    this.modalService.open(config);
  }

  openProjectWizard() {
    this.openModal_newProject = true;
  }

  createProject(data: any) {
    Project.create(this.electron, data.name, data.path)
      .then(p => this.projectLoaded(p))
      .catch(e => this.projectLoadError(e));
  }

  openProject() {
    this.electron.remote.dialog.showOpenDialog(
      this.electron.remote.getCurrentWindow(),
      {
        properties: ['openDirectory']
      },
      dirs => {
        if (dirs && dirs.length > 0) {
          Project.load(this.electron,dirs[0])
            .then(p => this.projectLoaded(p))
            .catch(e => this.projectLoadError(e));
        }
      }
    )
  }

  projectLoaded(project: Project) {
    this.ngZone.run(() => {
      this.activeSelection = null;
      this.editorFilename = null;
      this.editorOriginalContents = '';
      this.editorContents = '';
      this.project = project;
      this.titleService.setTitle(project.name + ' - Sygnaller');
    });
  }

  projectLoadError(error) {
    this.alert('Cannot load project', error.toString());
  }

  closeProject() {
    this.saveFile();
    this.project = null;
    this.titleService.setTitle('Sygnaller');
  }

  setDarkMode(dark: boolean) {
    Workspace.darkMode = dark;
    this.darkTheme = dark;
  }

  selectionChanged(selection: SidebarSelection) {
    if (!selection) {
      this.editorFilename = null;
      this.editorOriginalContents = '';
      this.editorContents = '';
      return;
    }

    if (!this.saveFile()) return; // ensure we save before moving away!
    console.log('Selection changed:', selection.category, '/', selection.file);

    let isText = (s: SidebarSelection) => {
      if (s.category == 'software') return true;
      if (s.category == 'hardware') return true;

      let allowedExtensions = ['txt', 'csv', 'py', 'v', 'md'];
      for(let ext of allowedExtensions) {
        if (s.file.toLowerCase().endsWith('.' + ext)) return true;
      }
    };

    if (isText(selection)) {
      // read file into editor
      let fullPath = this.electron.remote.require('path').resolve(this.project.path, selection.category, selection.file);
      this.electron.remote.require('fs').readFile(fullPath, 'utf-8', (err, data) => this.ngZone.run(() => {
        if (!err) {
          this.editorContents = data;
          this.editorOriginalContents = this.editorContents;
          setTimeout(() =>
          this.editorFilename = this.electron.remote.require('path').join(selection.category, selection.file)
          , 0);
        } else {
          this.editorContents = '';
          this.editorFilename = '';
        }
      }));
    } else {
      // hide the editor
      this.editorFilename = null;
    }
  }

  saveFile() {
    // return whether saving was successful
    if (!this.editorFilename || this.editorContents === this.editorOriginalContents) return true;
    let fullPath = this.electron.remote.require('path').resolve(this.project.path, this.editorFilename);
    try {
      console.log('Saving file', fullPath);
      this.electron.remote.require('fs').writeFileSync(fullPath, this.editorContents, 'utf-8');
      return true;
    } catch (err) {
      return false;
    }
  }

  @HostListener('window:beforeunload')
  beforeClosing() {
    return this.saveFile();
  }

  newFileWizard(category: string) {
    this.newFileModal_placeholder = ' ';
    setTimeout(() => this.newFileModal_placeholder = '', 0);
    this.newFileModal_category = category;
    this.newFileModal_dirname = this.electron.remote.require('path').join(this.project.path, category);
    this.openModal_newFile = true;
  }

  newFile(filename: string) {
    if (this.newFileModal_category == 'software') {
      if (!filename.toLowerCase().endsWith('.py')) {
        filename += '.py';
      }
    }

    let fullPath = this.electron.remote.require('path').resolve(this.newFileModal_dirname, filename);
    this.ngZone.run(() => {
      this.electron.remote.require('fs').writeFileSync(fullPath, '', 'utf-8');
    });
  }

  importFileWizard(category: string) {
    let ext;
    if (category == 'software') {
      ext = [{
        name: 'Python Files',
        extensions: ['py']
      }];
    } else if (category == 'hardware') {
      ext = [{
        name: 'Verilog Files',
        extensions: ['v']
      }];
    } else {
      ext = [];
    }
    this.electron.remote.dialog.showOpenDialog(
      this.electron.remote.getCurrentWindow(),
      {
        filters: ext
      },
      files => {
        if (files && files.length > 0) {
          for (let oldPath of files) {
            let baseName = this.electron.remote.require('path').basename(oldPath);
            let newPath = this.electron.remote.require('path').resolve(this.project.path, category, baseName);

            // automatically avoid duplicates
            newPath = Project.findUnconflictingName(this.electron, newPath);

            // perform file copy
            this.electron.remote.require('fs').copyFile(oldPath, newPath, err => {
              if (err)
                this.ngZone.run(() => this.alert('Import failed', err));
            });
          }
        }
      }
    )
  }

  newConnectionWizard() {
    this.openModal_newConnection = true;
  }

  connectPynq(mac: string, ip: string) {
    this.pynq.connect(mac, ip)
      .catch(err => {
        if (err) {
          this.alert('Connection failed', err);
        }
      });
  }

  disconnectPynq() {
    this.pynq.disconnect();
  }

  async runProject() {
    try {
      this.saveFile();
      await this.pynq.uploadFiles(this.project, p => this.progressBar = p);
      await this.pynq.startRunning(this.project);
      this.progressBar = null;
    } catch (err) {
      this.alert('Run failed', err);
      this.progressBar = null;
    }
  }

  async stopProject() {
    try {
      await this.pynq.stopRunning();
    } catch (err) {
      this.alert('Stop failed', err);
    }
  }

}
