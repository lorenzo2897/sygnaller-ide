import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ComponentBinding, VerilogModule, VerilogPort} from '../../classes/Components';

@Component({
  selector: 'app-component-block',
  templateUrl: './component-block.component.html',
  styleUrls: ['./component-block.component.scss']
})
export class ComponentBlockComponent implements OnInit {
  @Input() dark: boolean = false;

  private _verilogModule: VerilogModule;
  private inputPorts: VerilogPort[] = [];
  private outputPorts: VerilogPort[] = [];

  private _bindings: ComponentBinding[];
  private _bindingsMap: Map<string, string> = new Map();
  @Output() bindingsChange: EventEmitter<ComponentBinding[]> = new EventEmitter();

  constructor() { }

  @Input() set verilogModule(value: VerilogModule) {
    this._verilogModule = value;
    if (!value) {
      this.inputPorts = [];
      this.outputPorts = [];
      return;
    }
    this.inputPorts = value.ports.filter(p => p.direction == 'input');
    this.outputPorts = value.ports.filter(p => p.direction == 'output');
  }

  @Input() set bindings(value: ComponentBinding[]) {
    this._bindings = value;
    this._bindingsMap.clear();
    value.forEach(b => this._bindingsMap.set(b.portName, b.binding));
  }

  ngOnInit() {
  }

  removeBinding(port: string) {
    this.bindings = this._bindings.filter(b => b.portName != port);
    this.bindingsChange.emit(this._bindings);
  }

  setBinding(port: string, to: string) {
    if (to == 'scope') {
      this.bindings = this._bindings.filter(b => b.binding != 'scope');
    }
    this.bindings = this._bindings.filter(b => b.portName != port).concat([{
      portName: port,
      binding: to
    }]);
    this.bindingsChange.emit(this._bindings);
  }

}
