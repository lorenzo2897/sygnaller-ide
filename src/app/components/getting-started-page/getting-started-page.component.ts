import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {ElectronService} from 'ngx-electron';

@Component({
  selector: 'app-getting-started-page',
  templateUrl: './getting-started-page.component.html',
  styleUrls: ['./getting-started-page.component.scss']
})
export class GettingStartedPageComponent implements OnInit {

  @Input() @HostBinding('class.dark') darkTheme: boolean = false;

  constructor(private electron: ElectronService) { }

  ngOnInit() {
  }

  openPynq() {
    this.electron.shell.openExternal("https://pynq.readthedocs.io/en/latest/getting_started/pynq_z1_setup.html")
  }

  openDocs() {
    this.electron.shell.openExternal("http://sygnaller.silvestri.io/")
  }

}
