import {Component, HostBinding, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-getting-started-page',
  templateUrl: './getting-started-page.component.html',
  styleUrls: ['./getting-started-page.component.scss']
})
export class GettingStartedPageComponent implements OnInit {

  @Input() @HostBinding('class.dark') darkTheme: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
