
import {ElectronService} from 'ngx-electron';

export class Project {
  name: string;

  private remote_fs = null;
  private remote_path = null;

  private constructor(private electron: ElectronService, private path: string) {
    if (this.electron.isElectronApp) {
      this.remote_fs = this.electron.remote.require('fs');
      this.remote_path = this.electron.remote.require('path');
    }
  }

  private readPropertiesFromFile() {
  }
  private writePropertiesToFile() {
    console.log(this.name);
    console.log(this.path);
  }

  static create(electron: ElectronService, name: string, path: string) : Promise<Project> {
    return new Promise<Project>(resolve => {
      let p = new Project(electron, path);
      p.name = name;
      p.writePropertiesToFile();
      resolve(p);
    });
  }

  static load(electron: ElectronService, path: string) : Promise<Project> {
    return new Promise<Project>(resolve => {
      let p = new Project(electron, path);
      p.readPropertiesFromFile();
      resolve(p);
    });
  }
}
