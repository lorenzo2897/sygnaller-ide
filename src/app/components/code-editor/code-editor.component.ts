import {AfterViewInit, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AceEditorComponent} from 'ng2-ace-editor';
import {ElectronService} from 'ngx-electron';
import {Project} from '../../classes/Project';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements AfterViewInit {

  @Input() contents: string = '';
  @Input() project: Project;
  @Output() contentsChange: EventEmitter<string> = new EventEmitter<string>();

  @Output() buildNewComponent: EventEmitter<string> = new EventEmitter<string>();

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
    this.lookForVerilogModules();
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

  verilogModules: Map<number, string> = new Map();

  constructor(private electron: ElectronService) { }

  ngAfterViewInit() {
    this.editor.getEditor().commands.addCommand({
      name: "showOtherCompletions",
      bindKey: "Ctrl-.",
      exec: function (editor) {

      }
    });

    this.editor.getEditor().on('guttermousedown', e => {
      console.log(e);
      let target = e.domEvent.target;

      if (target.className.indexOf("ace_gutter-cell") == -1)
        return;
      if (!this.editor.getEditor().isFocused())
        return;
      if (e.clientX > 25 + target.getBoundingClientRect().left)
        return;

      let row = e.getDocumentPosition().row;
      let breakpoints = e.editor.session.getBreakpoints(row, 0);
      if(breakpoints[row]) {
        this.moduleContextMenu(row);
      }
      e.stop()
    })

  }

  textChanged() {
    this.contentsChange.emit(this.contents);
    this.lookForVerilogModules();
  }

  lookForVerilogModules() {
    if (this.editorMode != 'verilog') return;

    let regexModule = /module\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)/sig;

    this.verilogModules.clear();

    let m;
    let currChar = 0;
    let currLine = 0;
    while ((m = regexModule.exec(this.contents))) {
      let index = m.index;
      while (currChar < index) {
        if (this.contents.charAt(currChar) == '\n') ++currLine;
        ++currChar;
      }
      this.verilogModules.set(currLine, m[1]);
    }
    this.editor.getEditor().session.clearBreakpoints();
    this.verilogModules.forEach((_, line) => {
      this.editor.getEditor().session.setBreakpoint(line);
    });
  }

  moduleContextMenu(row: number) {
    let moduleName = this.verilogModules.get(row);
    let isInUse = this.project.components.has(moduleName);

    let menuOptions: any = [
      {
        label: 'module ' + this.verilogModules.get(row),
        enabled: false
      },
      {
        type: 'separator'
      },
      !isInUse ? {
        label: 'Create component',
        click: () => this.newComponent(moduleName)
      } : {
        label: 'Go to component',
        click: () => this.newComponent(null)
      }
    ];
    let menu = this.electron.remote.Menu.buildFromTemplate(menuOptions);
    menu.popup();
  }

  newComponent(name: string) {
    this.buildNewComponent.emit(name);
  }

}
