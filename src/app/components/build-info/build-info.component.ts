import {AfterViewChecked, Component, Input, OnInit, ViewChild} from '@angular/core';
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
}
