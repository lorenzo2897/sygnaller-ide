import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-rename-project-modal',
  templateUrl: './rename-project-modal.component.html',
  styleUrls: ['./rename-project-modal.component.scss']
})
export class RenameProjectModalComponent implements OnInit {

  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Output() renameProject: EventEmitter<any> = new EventEmitter<any>();

  _open: boolean;

  @Input() projectName: string;

  error: number = 0;

  @Input()
  set open(val: boolean) {
    this.error = 0;
    this._open = val;
  }

  constructor() { }

  ngOnInit() {
  }

  approved(modal) {
    if (this.projectName.length == 0) {
      return;
    }

    // close modal
    modal.approve();

    // fire event
    this.renameProject.emit(this.projectName);
  }

}
