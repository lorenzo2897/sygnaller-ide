
import {ElectronService} from 'ngx-electron';

const PROJECT_JSON_FILE = 'project.json';

export interface RecentProject {
  name: string,
  path: string
}

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

  private get projectJsonFile() : string {
    return this.remote_path.join(this.path, PROJECT_JSON_FILE);
  }

  private readPropertiesFromFile() : Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.remote_fs.existsSync(this.projectJsonFile)) reject('Project file does not exist');
      this.remote_fs.readFile(this.projectJsonFile, (err, data) => {
        if (err) reject(err);
        try {
          let properties = JSON.parse(data);
          this.name = properties.name;
        } catch (e) {
          reject('Project settings are corrupt');
        }
        resolve();
      });
    });
  }

  private writePropertiesToFile() : Promise<void> {
    let data = {
      name: this.name
    };

    return new Promise<void>((resolve, reject) => {
      if (!this.remote_fs.existsSync(this.path)) this.remote_fs.mkdirSync(this.path);
      this.remote_fs.writeFile(this.projectJsonFile, JSON.stringify(data), err => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  private addToRecents() {
    let recents = Project.recentlyOpened();
    recents = recents.filter(i => i.path != this.path); // remove previous instances of myself
    recents.unshift({name: this.name, path: this.path}); // add myself in
    recents.length = Math.min(recents.length, 5); // truncate to 5 recents
    localStorage.setItem('recentlyOpened', JSON.stringify(recents));
  }

  /* *********************** Static methods *********************** */

  static create(electron: ElectronService, name: string, path: string) : Promise<Project> {
    return new Promise<Project>((resolve, reject) => {
      let p = new Project(electron, path);
      p.name = name;
      p.writePropertiesToFile()
        .then(() => {
          p.addToRecents();
          resolve(p);
        })
        .catch(e => reject(e));
    });
  }

  static load(electron: ElectronService, path: string) : Promise<Project> {
    console.log('Loading project from ', path);
    return new Promise<Project>((resolve, reject) => {
      let p = new Project(electron, path);
      p.readPropertiesFromFile()
        .then(() => {
          p.addToRecents();
          resolve(p);
        })
        .catch(e => reject(e));
    });
  }

  static recentlyOpened() : RecentProject[] {
    let r = localStorage.getItem('recentlyOpened');
    if (r)
      return JSON.parse(r);
    else
      return [];
  }
}
