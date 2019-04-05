import {Injectable} from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class Pynq {
  public isConnected = false;

  public connectedMac: string = '';
  public connectedIp: string = '';

  public recentConnections = [];

  constructor() {
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

      /* connect to sygnaller daemon on pynq */
    });
  }

  disconnect() {

  }
}

export class PynqConnection {
  constructor(public mac: string, public ip: string) {}
}
