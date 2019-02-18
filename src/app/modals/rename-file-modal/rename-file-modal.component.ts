import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ElectronService} from 'ngx-electron';

@Component({
  selector: 'app-rename-file-modal',
  templateUrl: './rename-file-modal.component.html',
  styleUrls: ['./rename-file-modal.component.scss']
})
export class RenameFileModalComponent {

  @Input() modalTitle: string = 'Rename file';
  @Input() modalAction: string = 'Rename';

  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Output() renameFile: EventEmitter<any> = new EventEmitter<any>();

  _open: boolean;

  @Input() dirname: string;
  @Input() filename: string;

  error: number = 0;

  @Input()
  set open(val: boolean) {
    this.error = 0;
    this._open = val;
  }

  constructor(private electron: ElectronService) { }

  keyup(event, modal) {
    this.error = 0;
    if (event.code == 'Enter') {
      this.approved(modal);
    }
  }

  approved(modal) {
    // perform checks on the data
    if (this.filename.trim().length == 0) {
      this.error = 1;
      return;
    }
    if (this.filename.match(/[^a-z0-9_\-.]/gi)) {
      this.error = 2;
      return;
    }
    let fullpath = this.electron.remote.require('path').resolve(this.dirname, this.filename);
    if (this.electron.remote.require('fs').existsSync(fullpath)) {
      this.error = 3;
      return;
    }

    // close modal
    modal.approve();

    // fire event
    this.renameFile.emit(this.filename);
  }

}
