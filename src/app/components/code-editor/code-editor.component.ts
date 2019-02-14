import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements AfterViewInit {

  @Input() contents: string = '';

  @Input()
  set filename(val: string) {
    this._filename = val;
    this.title = val;
    if (val.toLowerCase().endsWith('.py')) {
      this.editorMode = 'python';
    } else if (val.toLowerCase().endsWith('.v')) {
      this.editorMode = 'verilog';
    } else {
      this.editorMode = 'text';
    }
  }

  _dark: boolean = false;
  @Input()
  set darkTheme(val: boolean) {
    this._dark = val;
    this.editorTheme = val ? 'monokai' : 'chrome';
  }

  _filename: string = '';
  title: string = '';

  @ViewChild('editor') editor;
  editorMode: string = 'python';
  editorTheme: string = 'chrome';
  editorOptions = {
    printMargin: false,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    useSoftTabs: true,
    scrollPastEnd: 0.5
  };

  constructor() { }

  ngAfterViewInit() {
    this.editor.getEditor().commands.addCommand({
      name: "showOtherCompletions",
      bindKey: "Ctrl-.",
      exec: function (editor) {

      }
    })
  }

}
