import { BrowserWindow } from 'electron';
import * as path from "path";
import * as url from "url";

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
        Main.window = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
              nodeIntegration: true
            }
        });
        Main.window.loadURL(
            url.format({
                pathname: path.join(__dirname, `/../../dist/sygnaller/index.html`),
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
