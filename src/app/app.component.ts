import {Component, HostListener, NgZone} from '@angular/core';
import { ElectronService } from 'ngx-electron';
import {Project} from './classes/Project';
import {Workspace} from './classes/Workspace';
import {Title} from '@angular/platform-browser';
import {SidebarSelection} from './components/sidebar/sidebar.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  darkTheme = Workspace.darkMode;
  project: Project = null;
  activeSelection: SidebarSelection = null;

  editorFilename: string = null;
  editorOriginalContents: string = '';
  editorContents: string = '';

  openModal_newProject = false;

  constructor(private electron: ElectronService, private ngZone: NgZone, private titleService: Title) {}

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
    this.electron.remote.dialog.showErrorBox('Cannot load project', error.toString())
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
    if (!selection) return;

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
  doSomething() {
    return this.saveFile();
  }

}
