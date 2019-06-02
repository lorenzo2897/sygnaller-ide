import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Project} from '../../classes/Project';
import {ComponentSpec, VerilogModule} from '../../classes/Components';
import {ElectronService} from 'ngx-electron';
import {forEach} from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-component-editor',
  templateUrl: './component-editor.component.html',
  styleUrls: ['./component-editor.component.scss']
})
export class ComponentEditorComponent implements OnInit {

  _ready = null;
  ready = new Promise(resolve => this._ready = resolve);

  @Input() darkTheme: boolean = false;
  @Input() project: Project = null;

  @Output() onError: EventEmitter<any> = new EventEmitter();

  availableModules: Map<string, VerilogModule> = new Map();

  componentWithVideoOut: string = null;

  constructor(private electron: ElectronService) {}

  async ngOnInit() {
    const fs = this.electron.remote.require('fs');
    const nodePath = this.electron.remote.require('path');

    // build module list from verilog sources
    let sources = (await this.project.listHardwareFiles())
      .map(f => nodePath.join(this.project.path, 'hardware', f))
      .map(f => fs.readFileSync(f, {encoding: 'utf-8'}));

    sources
      .map(s => VerilogModule.extractFrom(s))
      .reduce((a, b) => a.concat(b), [])
      .forEach(m => this.availableModules.set(m.name, m));

    this.project.components.forEach(c => {
      if (!this.availableModules.has(c.moduleName)) {
        this.deleteComponent(c);
      }
    });

    this.project.components.forEach(c => {
      if (c.bindings.find(b => b.binding == 'video out')) {
        this.componentWithVideoOut = c.moduleName;
      }
    });

    this._ready();
  }

  async newComponent(moduleName: string) {
    await this.ready;

    if (!this.availableModules.has(moduleName)) {
      this.onError.emit({
        title: 'Module not found',
        message: `The module "${moduleName}" was not found in your Verilog code. Make sure it is defined in code before attempting to build a component from it.`
      });
    }
    let module = this.availableModules.get(moduleName);

    if (this.project.components.has(module.name)) {
      this.onError.emit({
        title: 'Module already in use',
        message: `The module "${module.name}" is already being used by a different component. You may only build one component per module.`
      });
      return;
    }

    this.project.components.set(
      module.name,
      {
        moduleName: module.name,
        bindings: []
      }
    );

    this.project.save();
  }

  deleteComponent(c: ComponentSpec) {
    this.project.components.delete(c.moduleName);
    this.project.save();
  }

  clearVideoOut(except: string) {
    this.componentWithVideoOut = except;
    this.project.components.forEach(c => {
      if (c.moduleName != except) {
        c.bindings = c.bindings.filter(b => b.binding != 'video out');
      }
    })
  }

}
