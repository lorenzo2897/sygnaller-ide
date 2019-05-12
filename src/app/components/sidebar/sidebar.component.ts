import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output, ViewRef} from '@angular/core';
import {Project} from '../../classes/Project';
import {ElectronService} from 'ngx-electron';

export interface SidebarSelection {
  category: string,
  file: string
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements AfterViewInit {
  @Input() darkTheme: boolean = false;
  @Input() project: Project = null;
  @Input() showTools: boolean = false;

  @Input() selection: SidebarSelection = null;
  @Output() selectionChange: EventEmitter<SidebarSelection> = new EventEmitter<SidebarSelection>();

  @Output() runPythonFile: EventEmitter<string> = new EventEmitter<string>();

  tools = [
    {id: 'build', label: 'Build info', icon: 'info circle olive', runOnly: false},
    {id: 'terminal', label: 'Terminal', icon: 'terminal olive', runOnly: false},
    {id: 'oscilloscope', label: 'Oscilloscope', icon: 'chart area olive', runOnly: true},
    {id: 'video', label: 'Video stream', icon: 'video olive', runOnly: true}
  ];
  softwareFiles: string[] = [];
  hardwareFiles: string[] = [];
  dataFiles: string[] = [];

  renameModal_oldPath = null;
  renameModal_dirname = null;
  renameModal_placeholder = null;
  openModal_rename = false;

  deleteModal_fullPath = null;
  deleteModal_shortPath = null;
  openModal_delete = false;

  constructor(private electron: ElectronService, private changeDetector: ChangeDetectorRef, private ngZone: NgZone) { }

  ngAfterViewInit() {
    this.walkFileTree();
    this.electron.remote.require('fs').watch(this.project.path, {recursive: true}, () => this.walkFileTree());
  }

  walkFileTree() {
    let p1 = this.project.listSoftwareFiles()
      .then(files => this.softwareFiles = files)
      .catch(err => {
        this.softwareFiles = [];
        console.log(err);
      });
    let p2 = this.project.listHardwareFiles()
      .then(files => this.hardwareFiles = files)
      .catch(err => {
        this.hardwareFiles = [];
        console.log(err);
      });
    let p3 = this.project.listDataFiles()
      .then(files => this.dataFiles = files)
      .catch(err => {
        this.dataFiles = [];
        console.log(err);
      });
    Promise.all([p1, p2, p3]).then(
      () => {
        if (!(this.changeDetector as ViewRef).destroyed) this.changeDetector.detectChanges()
      }
    );
  }

  iconFromPath(path: string) : string {
    let icons = {
      'png': 'brown image outline',
      'gif': 'brown image outline',
      'jpg': 'brown image outline',
      'jpeg': 'brown image outline',
      'bmp': 'brown image outline',
      'mp4': 'orange file video outline',
      'mkv': 'orange file video outline',
      'mp3': 'teal volume up',
      'wav': 'teal volume up',
      'csv': 'green table'
    };

    let extension = path.substring(path.lastIndexOf('.') + 1).toLowerCase();
    if (extension in icons) {
      return icons[extension];
    }
    return 'file outline';
  }

  fileClicked(category: string, path: string) {
    this.selection = {category: category, file: path};
    this.selectionChange.emit(this.selection);
  }

  showContextMenu(category: string, path: string) {
    let menuOptions = [
      {
        label: 'Rename',
        click: () => this.renameFile(category, path)
      },
      {
        label: 'Delete',
        click: () => this.deleteFile(category, path)
      }
    ];
    if (category == 'software' && path.endsWith('.py')) {
      menuOptions.unshift({
        label: `Run ${path}`,
        click: () => this.runAsMain(category, path)
      });
    }
    let menu = this.electron.remote.Menu.buildFromTemplate(menuOptions);
    menu.popup();
  }

  renameFile(category, path) {
    this.ngZone.run(() => {
      let fullPath = this.electron.remote.require('path').resolve(this.project.path, category, path);
      let dirname = this.electron.remote.require('path').dirname(fullPath);
      let basename = this.electron.remote.require('path').basename(fullPath);

      this.renameModal_oldPath = fullPath;
      this.renameModal_dirname = dirname;
      this.renameModal_placeholder = basename;

      this.openModal_rename = true;
    });
  }

  renameFileResult(newName) {
    let fileIsCurrentlySelected = false;
    if (this.selection) {
      let selected = this.electron.remote.require('path').resolve(this.project.path, this.selection.category, this.selection.file);
      fileIsCurrentlySelected = (this.renameModal_oldPath == selected);
    }

    if (fileIsCurrentlySelected) {
      this.selection = null;
      this.selectionChange.emit(this.selection);
    }

    let newFullPath = this.electron.remote.require('path').resolve(this.renameModal_dirname, newName);
    this.electron.remote.require('fs').renameSync(this.renameModal_oldPath, newFullPath);
  }

  deleteFile(category, path) {
    this.ngZone.run(() => {
      let fullPath = this.electron.remote.require('path').resolve(this.project.path, category, path);
      let basename = this.electron.remote.require('path').basename(fullPath);

      this.deleteModal_fullPath = fullPath;
      this.deleteModal_shortPath = basename;

      this.openModal_delete = true;
    });
  }

  deleteFileConfirmed() {
    if (this.selection) {
      let selected = this.electron.remote.require('path').resolve(this.project.path, this.selection.category, this.selection.file);

      // de-select the file if it is currently selected
      if (this.deleteModal_fullPath == selected) {
        this.selection = null;
        this.selectionChange.emit(this.selection);
      }
    }

    this.electron.remote.require('fs').unlinkSync(this.deleteModal_fullPath);
  }

  runAsMain(category, path) {
    this.ngZone.run(() => {
      this.runPythonFile.emit(category + '/' + path)
    });
  }
}
