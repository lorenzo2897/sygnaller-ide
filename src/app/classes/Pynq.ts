import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {timeout} from 'rxjs/operators';
import {TimeoutError} from 'rxjs';
import {Project} from './Project';
import {ElectronService} from 'ngx-electron';

const REGISTRY_URL = 'http://silvestri.io:8000/';


@Injectable({
  providedIn: 'root',
})
export class Pynq {
  // Connection
  public connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  public connectedMac: string = '';
  public connectedIp: string = '';

  // Runtime
  public isRunning: boolean = false;

  // Recents
  public recentConnections = [];


  /* Private variables */
  private periodicCheckHandle = null;

  // File transfer
  private lastUploadTimes: Map<string, number> = new Map();


  constructor(private http: HttpClient, private electron: ElectronService) {
    let r = localStorage.getItem('recentConnections');
    if (r)
      this.recentConnections = JSON.parse(r);
    else
      this.recentConnections = [];
  }

  async connect(mac: string, ip: string) {
    /* disconnect first from any active connection */
    if (this.connectionStatus == ConnectionStatus.CONNECTING) {
      return;
    }
    if (this.connectionStatus == ConnectionStatus.CONNECTED) {
      await this.disconnect();
    }

    try {
      this.connectionStatus = ConnectionStatus.CONNECTING;

      /* sanity-check the mac or ip */
      if (mac == null && ip == null) {
        throw 'You need either a MAC address or an IP address to connect.';
      }

      /* add to recents */
      this.recentConnections = this.recentConnections.filter(i => i.mac != mac || i.ip != ip); // remove previous instances of myself
      this.recentConnections.unshift(new PynqConnection(mac, ip));
      this.recentConnections.length = Math.min(this.recentConnections.length, 3); // truncate to 3 recents
      localStorage.setItem('recentConnections', JSON.stringify(this.recentConnections));

      /* resolve MAC address if necessary */
      let resolvedIP;
      if (mac != null) {
        resolvedIP = await this.resolveMAC(mac);
      } else {
        resolvedIP = ip;
      }

      /* connect to sygnaller daemon on pynq */
      console.log('Connecting to ' + resolvedIP);
      let ping = await this.pingDevice(resolvedIP);

      /* success */
      console.log('Connected successfully', ping);
      this.connectionStatus = ConnectionStatus.CONNECTED;
      this.connectedMac = ping.mac;
      this.connectedIp = resolvedIP;
      this.lastUploadTimes.clear();

      /* set up a periodic ping to check whether we're still connected */
      this.periodicCheckHandle = setTimeout(() => this.periodicConnectionCheck(), 20000);

    } catch (e) {
      this.connectionStatus = ConnectionStatus.DISCONNECTED;
      throw e;
    }
  }

  removeFromRecents(c: PynqConnection) {
    this.recentConnections = this.recentConnections.filter(i => i.mac != c.mac || i.ip != c.ip); // remove previous instances of myself
    localStorage.setItem('recentConnections', JSON.stringify(this.recentConnections));
  }

  async periodicConnectionCheck() {
    if (this.connectionStatus != ConnectionStatus.CONNECTED) {
      return;
    }

    try {
      await this.pingDevice(this.connectedIp);
      this.periodicCheckHandle = setTimeout(() => this.periodicConnectionCheck(), this.isRunning ? 5000 : 20000);
    } catch (e) {
      this.disconnect(false);
    }
  }

  async disconnect(stopProcesses = true) {
    console.log('Disconnecting');

    /* make sure any running processes are stopped */
    if (stopProcesses) {
      await this.stopRunning();
    }

    /* stop the pings */
    if (this.periodicCheckHandle) {
      clearTimeout(this.periodicCheckHandle);
      this.periodicCheckHandle = null;
    }

    /* set the variables */
    this.connectionStatus = ConnectionStatus.DISCONNECTED;
    this.connectedMac = '';
    this.connectedIp = '';
  }

  resolveMAC(mac: string) : Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.get(REGISTRY_URL + '?action=query_device&mac=' + mac).pipe(timeout(5000)).subscribe((resp: any) => {
        if (resp.error) {
          console.log(resp);
          if (resp.error === 'Device not found') {
            reject('No matching device found. Check that the MAC address is correct, and that the Pynq board is connected to the internet.');
          } else {
            reject(resp.error);
          }
        } else {
          if (resp.ip) {
            // we're good
            resolve(resp.ip);
          } else {
            reject('There was an error with the registry service. Try connecting via IP address if you can.');
          }
        }

      }, err => {
        reject('Cannot connect to the registry. Check your computer\'s internet connection.');
      });
    })
  }

  async pingDevice(ip: string) {
    try {
      let resp: any = await this.http.post(`http://${ip}:8000/ping`, {}).pipe(timeout(6000)).toPromise();
      if (resp.error) {
        throw resp.error;
      } else {
        this.isRunning = resp.running;
        return resp;
      }
    } catch (err) {
      if (err instanceof HttpErrorResponse) {
        console.log('Connection error', err);
        throw 'The device is not responding. Check your connections and try again.';
      } else if (err instanceof TimeoutError) {
        console.log('Timeout error', err);
        throw 'The device is not responding. Check your connections and make sure that you are on the same network as the Pynq.';
      } else if (err instanceof DOMException) {
        console.log('DOM error', err);
        throw 'The format of the IP address is incorrect.';
      } else {
        console.log('Unknown error', err);
        throw err;
      }
    }
  }

  async uploadFiles(project: Project, callback: (progress: number) => void) {
    if (this.connectionStatus != ConnectionStatus.CONNECTED) throw 'You are not connected to a Pynq board';

    const fs = this.electron.remote.require('fs');
    const nodePath = this.electron.remote.require('path');

    // collect files
    const fullPath = (category: string, filename: string) => nodePath.resolve(project.path, category, filename);
    let softwareFiles = (await project.listSoftwareFiles()).map(f => fullPath('software', f));
    let hardwareFiles = (await project.listHardwareFiles()).map(f => fullPath('hardware', f));
    let dataFiles = (await project.listDataFiles()).map(f => fullPath('data', f));

    // select only those which were edited since last upload
    let modified = (filename: string) => {
      if (!this.lastUploadTimes.has(project.shortPath)) return true;
      const lastModified = Math.round(fs.statSync(filename).mtimeMs);
      return lastModified > this.lastUploadTimes.get(project.shortPath);
    };
    softwareFiles = softwareFiles.filter(f => modified(f));
    hardwareFiles = hardwareFiles.filter(f => modified(f));
    dataFiles = dataFiles.filter(f => modified(f));

    // count progress
    const totalFiles = softwareFiles.length + hardwareFiles.length + dataFiles.length;
    callback(0);

    // transfer to server
    const readToBase64 = (filename: string) => {
      return new Promise(resolve => {
        fs.readFile(filename, {encoding: 'base64'}, (err, data) => {
          if (err) {
            throw err;
          }
          resolve(data);
        });
      })
    };
    const sendFiles = async (files: string[]) => {
      let filesArray = [];

      for (let f of files) {
        filesArray.push({
          path: nodePath.relative(project.path, f),
          contents: await readToBase64(f)
        });
      }

      let requestContents = {
        project: project.shortPath,
        files: filesArray
      };

      try {
        let resp: any = await this.http.post(`http://${this.connectedIp}:8000/upload_files`, requestContents).toPromise();
        if (resp.error) {
          throw resp.error;
        }
      } catch (err) {
        if (err instanceof HttpErrorResponse || err instanceof DOMException) {
          console.log('Connection error', err);
          throw 'Lost connection to the device while uploading source files.';
        } else {
          console.log('Unknown error', err);
          throw err;
        }
      }
    };

    await sendFiles(softwareFiles);
    callback(softwareFiles.length * 100 / totalFiles);

    await sendFiles(hardwareFiles);
    callback((softwareFiles.length + hardwareFiles.length) * 100 / totalFiles);

    await sendFiles(dataFiles);
    callback(100);

    this.lastUploadTimes.set(project.shortPath, Date.now());
  }

  async startRunning(project: Project) {
    if (!project.hasMainPy()) {
      throw 'Your project must include a main.py file, which will be started when you click the Run button.';
    }
    let runOptions = {
      project: project.shortPath,
      target: 'software/main.py'
    };
    try {
      let resp: any = await this.http.post(`http://${this.connectedIp}:8000/run_python`, runOptions).toPromise();
      if (resp.error) {
        throw resp.error;
      }
      this.isRunning = true;
      clearTimeout(this.periodicCheckHandle);
      this.periodicCheckHandle = setTimeout(() => this.periodicConnectionCheck(), 2000);
    } catch (err) {
      if (err instanceof HttpErrorResponse || err instanceof DOMException) {
        console.log('Connection error', err);
        throw 'Lost connection to the device while uploading source files.';
      } else {
        console.log('Unknown error', err);
        throw err;
      }
    }
  }

  async stopRunning() {
    try {
      let resp: any = await this.http.post(`http://${this.connectedIp}:8000/stop_python`, {}).toPromise();
      if (resp.error) {
        throw resp.error;
      }
    } catch (err) {
      if (err instanceof HttpErrorResponse || err instanceof DOMException) {
        console.log('Connection error', err);
        throw 'Lost connection to the device while uploading source files.';
      } else {
        console.log('Unknown error', err);
        throw err;
      }
    }
  }

  async terminal(stdin: string = null) {
    let resp: any = await this.http.post(`http://${this.connectedIp}:8000/python_terminal`, {stdin: stdin}).pipe(timeout(9000)).toPromise();
    if (resp.error) {
      throw resp.error;
    }
    this.isRunning = resp.running;
    return resp;
  }
}

/* **************************************************************** */

export class PynqConnection {
  constructor(public mac: string, public ip: string) {}
}

export enum ConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED
}
