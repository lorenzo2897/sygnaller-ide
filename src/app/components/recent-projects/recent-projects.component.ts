import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-recent-projects',
  templateUrl: './recent-projects.component.html',
  styleUrls: ['./recent-projects.component.scss']
})
export class RecentProjectsComponent implements OnInit {
  @Input() darkTheme: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
