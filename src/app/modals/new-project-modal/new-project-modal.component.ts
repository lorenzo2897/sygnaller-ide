import {Component, EventEmitter, Input, Output, ChangeDetectorRef} from '@angular/core';
import {ElectronService} from 'ngx-electron';

@Component({
  selector: 'app-new-project-modal',
  templateUrl: './new-project-modal.component.html',
  styleUrls: ['./new-project-modal.component.scss']
})
export class NewProjectModalComponent {

  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Output() createProject: EventEmitter<any> = new EventEmitter<any>();

  _open: boolean;

  projectTitle: string;
  projectFilename: string;
  projectPath: string;

  autoFillFilename: boolean;
  titleError: boolean;
  filenameError: boolean;
  pathError: boolean;

  @Input()
  set open(val: boolean) {
    this.projectTitle = '';
    this.projectFilename = '';
    this.projectPath = this.getDesktopPath();

    this.autoFillFilename = true;
    this.titleError = false;
    this.filenameError = false;
    this.pathError = false;

    this._open = val;
  }

  constructor(private changeDetectorRef: ChangeDetectorRef, private electron: ElectronService) { }

  titleChanged() {
    this.titleError = false;
    if (this.autoFillFilename) {
      this.projectFilename = this.projectTitle.trim().replace(/[^a-z0-9]/gi, '-').toLowerCase();
    }
  }

  filenameChanged() {
    if (this.projectFilename.length == 0) {
      this.autoFillFilename = true;
    } else {
      this.autoFillFilename = false;
      this.filenameError = false;
    }
  }

  approved(modal) {
    // perform checks on the data
    if (this.projectTitle.trim().length == 0) {
      this.titleError = true;
      return;
    }
    if (this.projectFilename.trim().length == 0 || this.projectFilename.match(/[^a-z0-9_\-]/gi)) {
      this.filenameError = true;
      return;
    }
    if (this.projectPath.trim().length == 0 || !this.exists(this.projectPath)) {
      this.pathError = true;
      return;
    }

    // close modal
    modal.approve();

    // fire event
    let data = {
      name: this.projectTitle.trim(),
      path: this.joinPaths(this.projectPath, this.projectFilename)
    };
    this.createProject.emit(data);
  }

  private joinPaths(a: string, b: string) {
    if (this.electron.isElectronApp)
      return this.electron.remote.require('path').join(a, b);
    else
      return a + b;
  }

  private exists(path: string) {
    if (this.electron.isElectronApp)
      return this.electron.remote.require('fs').existsSync(path);
    else
      return true;
  }

  private getDesktopPath() {
    if (this.electron.isElectronApp)
      return this.electron.remote.app.getPath('desktop');
    else
      return '';
  }

  browseFolder() {
    if (this.electron.isElectronApp) {
      this.electron.remote.dialog.showOpenDialog(
        this.electron.remote.getCurrentWindow(),
        {
          properties: ['openDirectory']
        },
        dirs => {
          if (dirs && dirs.length > 0) {
            this.projectPath = dirs[0];
            this.pathError = false;
            this.changeDetectorRef.detectChanges();
          }
        }
      )
    }
  }
}
