
import {ElectronService} from 'ngx-electron';
import * as fs from 'fs';
import {ComponentSpec} from './Components';
import {demoMainPy} from './DemoMainPy';

const PROJECT_JSON_FILE = 'project.json';

export interface RecentProject {
  name: string,
  path: string
}

export class Project {
  name: string;
  components: Map<string, ComponentSpec> = new Map();

  private readonly remote_fs;
  private readonly remote_path;

  private constructor(private electron: ElectronService, public path: string) {
    if (this.electron.isElectronApp) {
      this.remote_fs = this.electron.remote.require('fs');
      this.remote_path = this.electron.remote.require('path');
    }
  }

  public get shortPath() {
    return this.remote_path.basename(this.path);
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
          this.components.clear();
          properties.components.forEach(c => this.components.set(c.moduleName, c));
        } catch (e) {
          reject('Project settings are corrupt');
        }
        resolve();
      });
    });
  }

  private writePropertiesToFile() : Promise<void> {
    let data = {
      name: this.name,
      components: Array.from(this.components.values())
    };

    return new Promise<void>((resolve, reject) => {
      if (!this.remote_fs.existsSync(this.path)) this.remote_fs.mkdirSync(this.path);
      this.remote_fs.writeFile(this.projectJsonFile, JSON.stringify(data), err => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  addToRecents() {
    let recents = Project.recentlyOpened();
    recents = recents.filter(i => i.path != this.path); // remove previous instances of myself
    recents.unshift({name: this.name, path: this.path}); // add myself in
    recents.length = Math.min(recents.length, 5); // truncate to 5 recents
    localStorage.setItem('recentlyOpened', JSON.stringify(recents));
  }

  private listFilesInDirectory(dirname: string) : Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      let fs = this.remote_fs;
      let path = this.remote_path;

      let walk = function(dir, done) {
        let results = [];
        fs.readdir(dir, function(err, list) {
          if (err) return done(err);
          let pending = list.length;
          if (!pending) return done(null, results);
          list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
              if (stat && stat.isDirectory()) {
                walk(file, function(err, res) {
                  results = results.concat(res);
                  if (!--pending) done(null, results);
                });
              } else {
                results.push(file);
                if (!--pending) done(null, results);
              }
            });
          });
        });
      };

      let filesDir = path.join(this.path, dirname);
      if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir);
      walk(filesDir, (err, res: string[]) => {
        if (err) reject(err);

        let filteredList = res.sort()
          .map(f => path.relative(filesDir, f))
          .filter(f => !f.endsWith('.DS_Store'));
        resolve(filteredList);
      })
    });
  }

  listSoftwareFiles() : Promise<string[]> {
    return this.listFilesInDirectory('software');
  }

  listHardwareFiles() : Promise<string[]> {
    return this.listFilesInDirectory('hardware');
  }

  listDataFiles() : Promise<string[]> {
    return this.listFilesInDirectory('data');
  }

  hasMainPy() : boolean {
    const p = this.remote_path.resolve(this.path, 'software/main.py');
    return this.remote_fs.existsSync(p);
  }

  save() {
    return this.writePropertiesToFile();
  }

  /* *********************** Static methods *********************** */

  static async create(electron: ElectronService, name: string, path: string) : Promise<Project> {
    let p = new Project(electron, path);
    p.name = name;
    await p.writePropertiesToFile();
    await p.listSoftwareFiles();
    const mainPy = p.remote_path.resolve(path, 'software/main.py');
    p.remote_fs.writeFile(mainPy, demoMainPy, () => {});
    p.addToRecents();
    return p;
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

  static findUnconflictingName(electron: ElectronService, filename: string) : string {
    // filename.ext -> filename-1.ext -> filename-2.ext -> ...

    if (!electron.remote.require('fs').existsSync(filename)) {
      return filename;
    }

    let extension = electron.remote.require('path').extname(filename);
    let prefix = filename.substring(0, filename.length - extension.length);
    let suffix = 1;

    while (electron.remote.require('fs').existsSync(filename)) {
      filename = `${prefix}-${suffix++}${extension}`;
    }

    return filename;
  }
}
