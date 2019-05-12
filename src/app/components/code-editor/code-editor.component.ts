import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AceEditorComponent} from 'ng2-ace-editor';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements AfterViewInit {

  @Input() contents: string = '';
  @Output() contentsChange: EventEmitter<string> = new EventEmitter<string>();

  @Input()
  set filename(val: string) {
    this._filename = val;
    this.title = val;

    let newOptions = JSON.parse(JSON.stringify(this.editorOptions));

    if (val.toLowerCase().endsWith('.py')) {
      this.editorMode = 'python';
      newOptions.enableBasicAutocompletion = true;
      newOptions.enableLiveAutocompletion = false;
    } else if (val.toLowerCase().endsWith('.v')) {
      this.editorMode = 'verilog';
      newOptions.enableBasicAutocompletion = true;
      newOptions.enableLiveAutocompletion = false;
    } else {
      this.editorMode = 'text';
      newOptions.enableBasicAutocompletion = false;
      newOptions.enableLiveAutocompletion = false;
    }
    this.editorOptions = newOptions;
    this.editor.getEditor().focus();
    this.editor.getEditor().getSession().setUndoManager(new window['ace'].UndoManager());
    this.editor.getEditor().selection.moveTo(0, 0);
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

  editorMode: string = 'text';
  editorTheme: string = 'chrome';
  editorOptions = {
    printMargin: false,
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: false,
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
    });

    // this.editor.getEditor().on('guttermousedown', e => {
    //   console.log(e);
    //   let target = e.domEvent.target;
    //
    //   if (target.className.indexOf("ace_gutter-cell") == -1)
    //     return;
    //   if (!this.editor.getEditor().isFocused())
    //     return;
    //   if (e.clientX > 25 + target.getBoundingClientRect().left)
    //     return;
    //
    //   let row = e.getDocumentPosition().row;
    //   e.editor.session.setBreakpoint(row);
    //   e.stop()
    // })

  }

  textChanged() {
    this.contentsChange.emit(this.contents);
  }

}
