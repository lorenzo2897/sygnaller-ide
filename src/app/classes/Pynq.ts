import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

const REGISTRY_URL = 'http://silvestri.io:8000/';


@Injectable({
  providedIn: 'root',
})
export class Pynq {
  public isConnected = false;

  public connectedMac: string = '';
  public connectedIp: string = '';

  public recentConnections = [];

  constructor(private http: HttpClient) {
    let r = localStorage.getItem('recentConnections');
    if (r)
      this.recentConnections = JSON.parse(r);
    else
      this.recentConnections = [];
  }

  connect(mac: string, ip: string) {
    return new Promise((resolve, reject) => {
      /* sanity-check the mac or ip */
      if (mac == null && ip == null) {
        reject('You need either a MAC address or an IP address to connect.');
        return;
      }

      /* add to recents */
      this.recentConnections = this.recentConnections.filter(i => i.mac != mac || i.ip != ip); // remove previous instances of myself
      this.recentConnections.unshift(new PynqConnection(mac, ip));
      this.recentConnections.length = Math.min(this.recentConnections.length, 3); // truncate to 3 recents
      localStorage.setItem('recentConnections', JSON.stringify(this.recentConnections));

      /* resolve MAC address if necessary */
      let p;
      if (mac != null) {
        p = this.resolveMAC(mac);
      } else {
        p = new Promise(r => r(ip));
      }

      /* connect to sygnaller daemon on pynq */
      p
        .catch(err => reject(err))
        .then(resolvedIP => {
          console.log(resolvedIP);
        });
    });
  }

  disconnect() {

  }

  resolveMAC(mac: string) {
    return new Promise((resolve, reject) => {
      this.http.get(REGISTRY_URL + '?action=query_device&mac=' + mac).subscribe((resp: any) => {
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
        reject('Cannot connect to the registry. Check your computer\'s internet connection');
      });
    })
  }
}

export class PynqConnection {
  constructor(public mac: string, public ip: string) {}
}
