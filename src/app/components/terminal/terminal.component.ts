import {Component, ElementRef, HostBinding, Input, ViewChild} from '@angular/core';
import {ConnectionStatus, Pynq} from '../../classes/Pynq';

interface TerminalOutput {
  t: OutputType,
  v: string
}

enum OutputType {
  StdIn,
  StdOut,
  StdErr,
  Image
}

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.scss']
})
export class TerminalComponent {
  OutputType = OutputType;
  @ViewChild('cmdline') cmdline: ElementRef;

  @Input() pynq: Pynq;
  private _show: boolean;
  @HostBinding('style.display') private _display: string = "block";
  @Input() darkTheme: boolean;

  commandHistory: string[] = [];
  cachedCommand: string = '';
  historyLevel: number = 0;

  stdin: string = '';
  stdout: TerminalOutput[] = [];
  remoteTerminalJob = null;

  constructor(private element: ElementRef) { }

  @Input() set show(value: boolean) {
    this._show = value;
    this._display = value ? 'block' : 'none';
    if (value == true) {
      this.historyLevel = 0;
      clearTimeout(this.remoteTerminalJob);
      this.remoteTerminal();
      setTimeout(() => this.cmdline.nativeElement.focus(), 0);
    } else {
      clearTimeout(this.remoteTerminalJob);
    }
  }

  @Input() set running(value: boolean) {
    if (value == true) {
      this.stdin = '';
      this.stdout = [{t: OutputType.StdErr, v: 'Python program starting.'}];
      clearTimeout(this.remoteTerminalJob);
      if (this._show) this.remoteTerminal();
    }
  }

  commandLineKey(event: KeyboardEvent) {
    if (event.code == 'Enter') {
      if (this.pynq.isRunning) {
        this.historyLevel = 0;
        this.cachedCommand = '';
        this.commandHistory.push((<any>event.target).value);
        this.addOutput('>>> ' + (<any>event.target).value + '\n');
        this.stdin += (<any>event.target).value + '\n';
        (<any>event.target).value = '';
      }
    }

    else if (event.code == 'ArrowUp') {
      if (this.historyLevel == 0) {
        // start browsing history
        this.cachedCommand = (<any>event.target).value;
      }
      if (this.historyLevel < this.commandHistory.length) {
        this.historyLevel++;
      }
      if (this.historyLevel > 0)
        (<any>event.target).value = this.commandHistory[this.commandHistory.length - this.historyLevel];

      return false; // prevent propagation of up arrow
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

  scrollToBottom() {
    setTimeout(() => this.element.nativeElement.scrollTop = this.element.nativeElement.scrollHeight, 0);
  }

  addOutput(text: string) {
    this.stdout.push({t: OutputType.StdIn, v: text});
    this.scrollToBottom();
  }

  addError(text: string) {
    this.stdout.push({t: OutputType.StdErr, v: text});
    this.scrollToBottom();
  }

  async remoteTerminal() {
    if (this.pynq.connectionStatus != ConnectionStatus.CONNECTED) return;

    try {
      let input = this.stdin == '' ? null : this.stdin;
      this.stdin = '';
      let response = await this.pynq.terminal(input);
      response.stdout.forEach(line => this.stdout.push({t: OutputType.StdOut, v: line}));
      response.images.forEach(line => this.stdout.push({t: OutputType.Image, v: line}));
      response.stderr.forEach(line => this.stdout.push({t: OutputType.StdErr, v: line}));
      this.scrollToBottom();

      if (response.running) {
        this.remoteTerminalJob = setTimeout(() => this.remoteTerminal(), 600);
      }
    } catch (e) {

    }
  }

}
