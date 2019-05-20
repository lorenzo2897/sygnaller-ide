import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Pynq} from '../../classes/Pynq';

@Component({
  selector: 'app-video-stream',
  templateUrl: './video-stream.component.html',
  styleUrls: ['./video-stream.component.scss']
})
export class VideoStreamComponent implements OnInit, OnDestroy {

  @Input() pynq: Pynq;

  img: string = null;
  error: string = 'No active video';
  timeout = null;

  constructor() { }

  ngOnInit() {
    this.check();
  }

  ngOnDestroy() {
    clearTimeout(this.timeout);
  }

  arrayBufferToBase64( buffer ) {
    return new Promise<string>(resolve => {
      let blob = new Blob([buffer],{type:'application/octet-binary'});
      let reader = new FileReader();
      reader.onload = (evt: any) => {
        resolve(evt.target.result);
      };
      reader.readAsDataURL(blob);
    });
  }

  async check() {
    try {
      let frame: ArrayBuffer = await this.pynq.getVideoStream();
      if (frame.byteLength > 100) {
        this.img = await this.arrayBufferToBase64(frame);
      }
      this.error = null;
    } catch (e) {
      if (e != 'USE_CACHED') {
        this.img = null;
        this.error = e;
      }
    }
    this.timeout = setTimeout(() => this.check(), 2000)
  }

}
