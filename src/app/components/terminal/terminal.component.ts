import {Component, ElementRef, Input} from '@angular/core';
import {Pynq} from '../../classes/Pynq';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent {

  @Input() pynq: Pynq;
  private _show: boolean;
  @Input() darkTheme: boolean;

  commandHistory: string[] = [];
  cachedCommand: string = '';
  historyLevel: number = 0;

  stdout: string = '';

  constructor(private element: ElementRef) { }

  @Input() set show(value: boolean) {
    this._show = value;
    if (value == true) {
      this.historyLevel = 0;
    }
  }

  commandLineKey(event: KeyboardEvent) {
    if (event.code == 'Enter') {
      this.historyLevel = 0;
      this.cachedCommand = '';
      this.commandHistory.push((<any>event.target).value);
      this.addOutput((<any>event.target).value + '\n');
      (<any>event.target).value = '';
    }

    else if (event.code == 'ArrowUp') {
      if (this.historyLevel == 0) {
        // start browsing history
        this.cachedCommand = (<any>event.target).value;
      }
      if (this.historyLevel < this.commandHistory.length) {
        this.historyLevel++;
      }
      (<any>event.target).value = this.commandHistory[this.commandHistory.length - this.historyLevel];
      return false;
    }

    else if (event.code == 'ArrowDown') {
      if (this.historyLevel == 0) return;
      this.historyLevel--;
      if (this.historyLevel == 0) {
        (<any>event.target).value = this.cachedCommand;
      } else {
        (<any>event.target).value = this.commandHistory[this.commandHistory.length - this.historyLevel];
      }
    }
  }

  addOutput(text: string) {
    this.stdout += text;
    setTimeout(() => this.element.nativeElement.scrollTop = this.element.nativeElement.scrollHeight, 0);
  }

}
