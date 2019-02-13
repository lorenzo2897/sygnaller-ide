import { BrowserWindow } from 'electron';
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import * as electron from 'electron';

export default class Main {
    static window: Electron.BrowserWindow;
    static application: Electron.App;

    private static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onClose() {
        // Dereference the window object
        Main.window = null;
    }

    private static onReady() {
        Main.createWindow();
    }

    private static onActivate() {
        Main.createWindow();
    }

    private static createWindow() {
        //Intercept any urls on the page and find the file on disk instead
        electron.protocol.interceptFileProtocol('file', function(req, callback) {
          var url = req.url.substr(7);
          console.log(url);
          var p = path.join(__dirname, `/../../dist/${url}`);
          if (fs.existsSync(p)) {
            callback(p);
          } else {
            callback(path.join('/', url));
          }
        },function (error) {
          if (error) {
            console.error('Failed to register protocol');
          }
        });

        Main.window = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
              nodeIntegration: true,
              webSecurity: false
            }
        });
        Main.window.loadURL(
            url.format({
                pathname: 'index.html', // path.join(__dirname, `/../../dist/index.html`),
                protocol: "file:",
                slashes: true
            })
        );
        Main.window.on('closed', Main.onClose);
    }

    static main(app: Electron.App) {
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('activate', Main.onActivate);
        Main.application.on('ready', Main.onReady);
    }
}
