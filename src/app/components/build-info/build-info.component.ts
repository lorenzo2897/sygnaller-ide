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
        }
      }
    }

    this.cdRef.detectChanges();
  }
}
