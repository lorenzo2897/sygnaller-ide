import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {timeout} from 'rxjs/operators';
import {TimeoutError} from 'rxjs';

const REGISTRY_URL = 'http://silvestri.io:8000/';


@Injectable({
  providedIn: 'root',
})
export class Pynq {
  public connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  public connectedMac: string = '';
  public connectedIp: string = '';

  public isRunning: boolean = false;

  public recentConnections = [];

  private periodicCheckHandle = null;

  constructor(private http: HttpClient) {
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
      this.connectedMac = mac;
      this.connectedIp = resolvedIP;

      /* set up a periodic ping to check whether we're still connected */
      this.periodicCheckHandle = setInterval(() => this.periodicConnectionCheck(), 20000);

    } catch (e) {
      this.connectionStatus = ConnectionStatus.DISCONNECTED;
      throw e;
    }
  }

  async periodicConnectionCheck() {
    if (this.connectionStatus != ConnectionStatus.CONNECTED) {
      clearInterval(this.periodicCheckHandle);
      this.periodicCheckHandle = null;
    }

    try {
      await this.pingDevice(this.connectedIp);
    } catch (e) {
      this.disconnect(false);
    }
  }

  disconnect(stopProcesses = true) {
    console.log('Disconnecting');
    /* make sure any running processes are stopped */
    if (stopProcesses) {

    }

    /* stop the pings */
    if (this.periodicCheckHandle) {
      clearInterval(this.periodicCheckHandle);
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
        throw 'The device is not responding. Check your connections and try again.';
      } else if (err instanceof DOMException) {
        console.log('DOM error', err);
        throw 'The format of the IP address is incorrect.';
      } else {
        console.log('Unknown error', err);
        throw err;
      }
    }

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
