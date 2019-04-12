import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-new-connection-modal',
  templateUrl: './new-connection-modal.component.html',
  styleUrls: ['./new-connection-modal.component.scss']
})
export class NewConnectionModalComponent {

  _open: boolean = false;

  @Input()
  set open(val: boolean) {
    this.connectionMode = 'mac';
    this.mac = '';
    this.ip = '';
    this.error = 0;
    this._open = val;
  }

  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Output() connect: EventEmitter<any> = new EventEmitter<any>();

  connectionMode: string = 'mac';
  mac: string = '';
  ip: string = '';
  error: number = 0;

  constructor() { }

  approved(modal) {
    let strippedMac = this.mac.replace(/:/g, '');

    // check for errors
    if (this.connectionMode == 'mac') {
      if(!/^[0-9a-f]{12}$/i.test(strippedMac)) {
        this.error = 1;
        return;
      }
    } else {
      if (this.ip.includes(':')) {
        // ipv6, anything goes
      } else {
        // ipv4
        let ipParts = this.ip.split('.');
        if (ipParts.length != 4 || ipParts.find(n => Number(n) > 255 || isNaN(+n))) {
          this.error = 2;
          return;
        }
      }
    }

    // close modal
    modal.approve();

    // fire event
    this.connect.emit({
      mac: (this.connectionMode == 'mac' ? strippedMac.toUpperCase() : null),
      ip: (this.connectionMode == 'ip' ? this.ip : null)
    });
  }

}
