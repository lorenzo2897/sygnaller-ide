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

  editorOptions = {theme: 'vs-dark', language: 'javascript'};
  model: string= 'function x() {\nconsole.log("Hello world!");\n}';
  column: number = 0;
  lineNumber: number = 0;

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

  async onEditorInitialized(editor: any): Promise<void> {
    let line: any = await editor.getPosition();

    this.column = line.column;
    this.lineNumber = line.lineNumber;
  }
}
