import { Component, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sygnaller';
  fdata = 'File drop test';

  constructor(private electron: ElectronService, private ngZone: NgZone) {}

  onDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      
      for (let f of event.dataTransfer.files) {
        console.log('File you dragged here: ', f.path)
        if (f.path.endsWith('.txt')) {
          this.electron.remote.require('fs').readFile(f.path, 'utf-8', (err, data) => this.ngZone.run(() => {
            if(!err) this.fdata = data;
        }));
        }
      }
  }
  onDragOver(event) {
      event.stopPropagation();
      event.preventDefault();
  }
}
