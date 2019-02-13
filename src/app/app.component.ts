import {Component, NgZone} from '@angular/core';
import { ElectronService } from 'ngx-electron';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sygnaller';
  fdata = 'File drop test';

  editorDarkTheme = false;
  editorFilename = 'untitled.py';
  editorContents = 'test';

  constructor(private electron: ElectronService, private ngZone: NgZone) {}

  onDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      
      for (let f of event.dataTransfer.files) {
        console.log('File you dragged here: ', f.path);
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

  pingGoogle() {
    let exec = this.electron.remote.require('child_process').exec;

    let callback = (err, stdout, stderr) => this.ngZone.run(() => {
      if (err) {
        console.log(`exec error: ${err}`);
        return;
      }else{
        console.log(stdout);
        this.fdata = `${stdout}`;
      }
    });

    exec('ping -c 1 8.8.8.8', callback);
  }
}
