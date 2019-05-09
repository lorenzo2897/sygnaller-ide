import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ComponentBinding, VerilogModule, VerilogPort} from '../../classes/Components';

@Component({
  selector: 'app-component-block',
  templateUrl: './component-block.component.html',
  styleUrls: ['./component-block.component.scss']
})
export class ComponentBlockComponent implements OnInit {
  private _verilogModule: VerilogModule;
  private inputPorts: VerilogPort[] = [];
  private outputPorts: VerilogPort[] = [];

  @Input() bindings: ComponentBinding[];
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

  ngOnInit() {
  }

}
