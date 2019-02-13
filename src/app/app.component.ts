import {AfterViewInit, Component, NgZone, ViewChild} from '@angular/core';
import { ElectronService } from 'ngx-electron';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'sygnaller';
  fdata = 'File drop test';

  @ViewChild('editor') editor;
  editorMode: string = 'python';
  editorTheme: string = 'eclipse';
  editorText: string = "";
  editorOptions = {
    printMargin: false,
    enableSnippets: true,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    useSoftTabs: true
  };

  constructor(private electron: ElectronService, private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.editor.getEditor().commands.addCommand({
      name: "showOtherCompletions",
      bindKey: "Ctrl-.",
      exec: function (editor) {

      }
    })
  }

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
