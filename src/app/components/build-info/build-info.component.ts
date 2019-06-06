import {AfterViewChecked, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ConnectionStatus, Pynq} from '../../classes/Pynq';
import {SidebarSelection} from '../sidebar/sidebar.component';

@Component({
  selector: 'app-build-info',
  templateUrl: './build-info.component.html',
  styleUrls: ['./build-info.component.scss']
})
export class BuildInfoComponent implements OnInit, AfterViewChecked {
  PynqStatus = ConnectionStatus;

  @ViewChild('textarea') textarea;
  disableAutoScroll = false;

  @Input() pynq: Pynq;
  private _lastBuildStatus: string;

  @Output() linkClicked: EventEmitter<FileLink> = new EventEmitter();
  @Output() stopBuild: EventEmitter<void> = new EventEmitter();

  buildTimeTaken: string = '';

  TNS: number = 0;
  WNS: number = 0;
  absWNS: number = 0;
  THS: number = 0;
  WHS: number = 0;
  absWHS: number = 0;

  usageLUTs = {used: 0, total: 0, percent: 0};
  usageRegs = {used: 0, total: 0, percent: 0};
  usageRAM = {used: 0, total: 0, percent: 0};
  usageDSP = {used: 0, total: 0, percent: 0};

  errorList: BuildError[];

  constructor() { }

  ngOnInit() {
  }

  private onScroll() {
    let el = this.textarea.nativeElement;
    let isBottom = el.scrollHeight - el.scrollTop === el.clientHeight;
    this.disableAutoScroll = !isBottom;
  }

  ngAfterViewChecked() {
    if (!this.disableAutoScroll) {
      setTimeout(this.textarea.nativeElement.scrollTop = this.textarea.nativeElement.scrollHeight, 20);
    }
  }

  @Input() set lastBuildStatus(value: string) {
    this._lastBuildStatus = value;

    if (value == 'SUCCESS') {
      this.buildSuccess();
    } else if (value == 'SYNTHESIS_FAIL') {
      this.buildSynthFail();
    } else if (value == 'SYNTAX_ERROR') {
      this.buildSyntaxFail();
    }
  }

  private buildSuccess() {
    for (let line of this.pynq.buildReport.split('\n')) {
      let cols = line.trim().split(',');
      if (cols.length < 2) continue;

      if (cols[0] == 'ELAPSED') {
        this.buildTimeTaken = cols[1];
      } else if (cols[0] == 'TNS') {
        this.TNS = +cols[1];
      } else if (cols[0] == 'WNS') {
        this.WNS = +cols[1];
        this.absWNS = Math.abs(+cols[1]);
      } else if (cols[0] == 'THS') {
        this.THS = +cols[1];
      } else if (cols[0] == 'WHS') {
        this.WHS = +cols[1];
        this.absWHS = Math.abs(+cols[1]);
      } else if (cols[0] == 'LUT') {
        this.usageLUTs = {
          used: +cols[1],
          total: +cols[2],
          percent: +cols[3]
        }
      } else if (cols[0] == 'REGISTERS') {
        this.usageRegs = {
          used: +cols[1],
          total: +cols[2],
          percent: +cols[3]
        }
      } else if (cols[0] == 'BRAM') {
        this.usageRAM = {
          used: +cols[1],
          total: +cols[2],
          percent: +cols[3]
        }
      } else if (cols[0] == 'DSP') {
        this.usageDSP = {
          used: +cols[1],
          total: +cols[2],
          percent: +cols[3]
        }
      }
    }
  }


  private buildSynthFail() {
    const sourceError = /ERROR: \[(.*?)\] (.*) \[\/home\/ls2715\/vivado_projects\/.*\/Pynq-Z1\/.*\/([a-zA-Z0-9_]+)_v[0-9]+_[0-9]+_S00_AXI\.v:([0-9]+)\]/;
    const fileError = /ERROR: \[(.*?)\] (.*) \[\/home\/ls2715\/vivado_projects\/.*\/Pynq-Z1\/.*\/(.*)\]/;
    const miscError = /ERROR: \[(.*?)\] (.*)/;

    this.errorList = [];
    this.pynq.buildReport.split('\n').forEach(line => {
      let m;

      if ((m = sourceError.exec(line))) {
        let moduleName = m[3];
        let wrapperLine = +m[4];

        let sourceFile = `Auto-generated wrapper for ${moduleName}`;
        let sourceLine = null;

        for (let mapping of this.pynq.sourceMappings) {
          if (wrapperLine >= mapping.start && wrapperLine <= mapping.end) {
            sourceFile = mapping.file;
            sourceLine = wrapperLine - mapping.start + 1;
            break;
          }
        }

        this.errorList.push({
          id: m[1],
          message: m[2],
          file: sourceFile,
          line: sourceLine,
          link: sourceLine ? {category: 'hardware', file: sourceFile} : null
        });

      } else if ((m = fileError.exec(line))) {
        this.errorList.push({
          id: m[1],
          message: m[2],
          file: m[3],
          line: null,
          link: null
        });

      } else if ((m = miscError.exec(line))) {
        if (!line.includes('please see the console or run log file for details')) {
          this.errorList.push({
            id: m[1],
            message: m[2],
            file: null,
            line: null,
            link: null
          });
        }

      } else {
        this.errorList.push({
          id: null,
          message: line,
          file: null,
          line: null,
          link: null
        });
      }
    });
  }


  private buildSyntaxFail() {
    const sourceError = /[A-Z ]+: \[(.*?)\] (.*) \[\/home\/ls2715\/vivado_projects\/.*\/ip\/.*\/([a-zA-Z0-9_]+)_v[0-9]+_[0-9]+_S00_AXI\.v:([0-9]+)\]/;
    const fileError = /CRITICAL WARNING: \[(.*?)\] (.*) \[\/home\/ls2715\/vivado_projects\/.*\/ip\/.*\/(.*)\]/;
    const miscError = /([A-Z ]+): \[(.*?)\] (.*)/;

    this.errorList = [];
    this.pynq.buildReport.split('\n').forEach(line => {
      let m;

      if ((m = sourceError.exec(line))) {
        let moduleName = m[3];
        let wrapperLine = +m[4];

        let sourceFile = `Auto-generated wrapper for ${moduleName}`;
        let sourceLine = null;

        for (let mapping of this.pynq.sourceMappings) {
          if (wrapperLine >= mapping.start && wrapperLine <= mapping.end) {
            sourceFile = mapping.file;
            sourceLine = wrapperLine - mapping.start + 1;
            break;
          }
        }

        this.errorList.push({
          id: m[1],
          message: m[2],
          file: sourceFile,
          line: sourceLine,
          link: sourceLine ? {category: 'hardware', file: sourceFile} : null
        });

      } else if ((m = fileError.exec(line))) {
        this.errorList.push({
          id: m[1],
          message: m[2],
          file: m[3],
          line: null,
          link: null
        });

      } else if ((m = miscError.exec(line))) {
        if (m[1] == "WARNING") return;
        if (!line.includes('please see the console or run log file for details')) {
          this.errorList.push({
            id: m[2],
            message: m[3],
            file: null,
            line: null,
            link: null
          });
        }

      } else {
        this.errorList.push({
          id: null,
          message: line,
          file: null,
          line: null,
          link: null
        });
      }
    });
  }


  onFileClick(link: SidebarSelection, line: number) {
    if (link) this.linkClicked.emit({selection: link, line: line});
  }


  onStopBuild() {
    this.stopBuild.emit();
  }
}

interface BuildError {
  id: string,
  message: string,
  file: string,
  line: number,
  link: SidebarSelection
}

interface FileLink {
  selection: SidebarSelection,
  line: number
}
