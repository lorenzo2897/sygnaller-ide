import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Project, RecentProject} from '../../classes/Project';
import {ElectronService} from 'ngx-electron';

@Component({
  selector: 'app-recent-projects',
  templateUrl: './recent-projects.component.html',
  styleUrls: ['./recent-projects.component.scss']
})
export class RecentProjectsComponent {
  @Input() darkTheme: boolean = false;

  @Output() loadProject: EventEmitter<Project> = new EventEmitter<Project>();

  recentProjects: RecentProject[] = Project.recentlyOpened();

  constructor(private electron: ElectronService) { }

  openProject(path: string) {
    Project.load(this.electron, path)
      .then(project => {
        this.loadProject.emit(project)
      })
      .catch(err => {
        this.electron.remote.dialog.showErrorBox('Cannot load project', err.toString());
        this.pruneFromRecents(path);
      })
  }

  pruneFromRecents(path: string) {
    let recents = Project.recentlyOpened();
    recents = recents.filter(i => i.path != path);
    localStorage.setItem('recentlyOpened', JSON.stringify(recents));
    this.recentProjects = recents;
  }

}
