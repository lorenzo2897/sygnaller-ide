import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
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

  @Input() selection: SidebarSelection = null;
  @Output() selectionChange: EventEmitter<SidebarSelection> = new EventEmitter<SidebarSelection>();

  softwareFiles: string[] = [];
  hardwareFiles: string[] = [];
  dataFiles: string[] = [];

  constructor(private electron: ElectronService, private changeDetector: ChangeDetectorRef) { }

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
      () => this.changeDetector.detectChanges()
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
}
