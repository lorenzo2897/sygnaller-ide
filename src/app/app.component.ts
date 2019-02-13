import { Component, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';

import { BaseEditor } from 'ngx-monaco-editor/base-editor';

let loadedMonaco = false; // need this for electron
let loadPromise: Promise<void>; // need this for electron

// this function overwrites the internal function of ngx-monaco-editor
// and it is used just so that monaco editor can run in electron
BaseEditor.prototype.ngAfterViewInit = function() {
  // tslint:disable-next-line:no-invalid-this
  const _this = this;
  if (loadedMonaco) {
    // Wait until monaco editor is available
    loadPromise.then(() => {
      _this.initMonaco(_this.options);
    });
  } else {
    loadedMonaco = true;
    loadPromise = new Promise<void>((resolve: any) => {
      console.log(_this.config);
      const baseUrl: string = 'assets';
      if (typeof ((<any>window).monaco) === 'object') {
        resolve();
        return;
      }

      const onGotAmdLoader: any = () => {
        // Load monaco
        (<any>window).require.config({ paths: { vs: `${baseUrl}/monaco/vs` } });
        (<any>window).require(['vs/editor/editor.main'], () => {
          if (typeof _this.config.onMonacoLoad === 'function') {
            _this.config.onMonacoLoad();
          }
          _this.initMonaco(_this.options);
          resolve();
        });
      };

      // Load AMD loader if necessary
      if (!(<any>window).require) {
        const loaderScript: any = document.createElement('script');
        loaderScript.type = 'text/javascript';
        loaderScript.src = `${baseUrl}/monaco/vs/loader.js`;
        loaderScript.addEventListener('load', onGotAmdLoader);
        document.body.appendChild(loaderScript);

      } else if (!(<any>window).require.config) {
        const amdLoader = (<any>window).require(`${baseUrl}/monaco/vs/loader.js`);
        const amdRequire: any = amdLoader.require;

        const monacoDir: string = 'sygnaller';// remote.getGlobal('monacoDir');

        // Load monaco
        const mncDir = monacoDir.replace(/\\/g, '/');
        amdRequire.config({ paths: { vs: mncDir } });
        console.log('​BaseEditor.prototype.ngAfterViewInit -> monacoDir', mncDir);

        amdRequire(['vs/editor/editor.main'], () => {
          if (typeof _this.config.onMonacoLoad === 'function') {
            _this.config.onMonacoLoad();
          }
          _this.initMonaco(_this.options);
          resolve();
        });

      } else {
        onGotAmdLoader();
      }
    });
  }
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sygnaller';
  fdata = 'File drop test';

  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript'
  };

  code: string= 'function x() {\nconsole.log("Hello world!");\n}';

  constructor(private electron: ElectronService, private ngZone: NgZone) {}

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
