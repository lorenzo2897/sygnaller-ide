import {AfterViewChecked, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Pynq} from '../../classes/Pynq';

@Component({
  selector: 'app-build-info',
  templateUrl: './build-info.component.html',
  styleUrls: ['./build-info.component.scss']
})
export class BuildInfoComponent implements OnInit, AfterViewChecked {
  @ViewChild('textarea') textarea;

  @Input() pynq: Pynq;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewChecked() {
    setTimeout(this.textarea.nativeElement.scrollTop = this.textarea.nativeElement.scrollHeight, 20);
  }
}
