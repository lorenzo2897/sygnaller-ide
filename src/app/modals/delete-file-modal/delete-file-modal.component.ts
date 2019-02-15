import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-delete-file-modal',
  templateUrl: './delete-file-modal.component.html',
  styleUrls: ['./delete-file-modal.component.scss']
})
export class DeleteFileModalComponent {

  @Input() open: boolean = false;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Output() deleteFile: EventEmitter<any> = new EventEmitter<any>();
  @Input() filename: string;

  constructor() { }

  approved(modal) {
    // close modal
    modal.approve();

    // fire event
    this.deleteFile.emit(this.filename);
  }

}
