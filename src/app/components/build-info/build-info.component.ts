import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Pynq} from '../../classes/Pynq';

@Component({
  selector: 'app-build-info',
  templateUrl: './build-info.component.html',
  styleUrls: ['./build-info.component.scss']
})
export class BuildInfoComponent implements OnInit, AfterViewChecked {
  @ViewChild('textarea') textarea;
  disableAutoScroll = false;

  @Input() pynq: Pynq;

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

  constructor(private cdRef: ChangeDetectorRef) { }

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

  @ViewChild('buildSuccess') set buildSuccess(element) {
    if (element) {
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

    this.cdRef.detectChanges();
  }
}
