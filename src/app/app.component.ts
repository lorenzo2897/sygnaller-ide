import {Component, NgZone} from '@angular/core';
import { ElectronService } from 'ngx-electron';
import {Project} from './classes/Project';
import {Workspace} from './classes/Workspace';
import {Title} from '@angular/platform-browser';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  fdata = 'File drop test';

  darkTheme = Workspace.darkMode;
  project: Project = null;
  editorFilename = 'untitled.py';
  editorContents = 'test';

  openModal_newProject = false;

  constructor(private electron: ElectronService, private ngZone: NgZone, private titleService: Title) {}

  openProjectWizard() {
    this.openModal_newProject = true;
  }

  createProject(data: any) {
    Project.create(this.electron, data.name, data.path)
      .then(p => this.projectLoaded(p))
      .catch(e => this.projectLoadError(e));
  }

  openProject() {
    this.electron.remote.dialog.showOpenDialog(
      this.electron.remote.getCurrentWindow(),
      {
        properties: ['openDirectory']
      },
      dirs => {
        if (dirs && dirs.length > 0) {
          Project.load(this.electron,dirs[0])
            .then(p => this.projectLoaded(p))
            .catch(e => this.projectLoadError(e));
        }
      }
    )
  }

  projectLoaded(project: Project) {
    this.ngZone.run(() => {
      this.project = project;
      this.titleService.setTitle(project.name + ' - Sygnaller');
    });
  }

  projectLoadError(error) {
    this.electron.remote.dialog.showErrorBox('Cannot load project', error.toString())
  }

  closeProject() {
    this.project = null;
    this.titleService.setTitle('Sygnaller');
  }

  setDarkMode(dark: boolean) {
    Workspace.darkMode = dark;
    this.darkTheme = dark;
  }

  // ***************************************

  onDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      
      for (let f of event.dataTransfer.files) {
        console.log('File you dragged here: ', f.path);
        if (f.path.endsWith('.txt')) {
          this.electron.remote.require('fs').readFile(f.path, 'utf-8', (err, data) => this.ngZone.run(() => {
            if(!err) this.fdata = data;
        }));
        }
      }
  }

  onDragOver(event) {
      event.stopPropagation();
      event.preventDefault();
  }

}
