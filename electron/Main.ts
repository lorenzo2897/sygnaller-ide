import { BrowserWindow, MenuItemConstructorOptions, Menu } from 'electron';
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
      Main.createApplicationMenu();
      Main.createWindow();
    }

    private static onActivate() {
        Main.createWindow();
    }

    private static createWindow() {
        Main.window = new BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 770,
            minHeight: 200,
            backgroundColor: '#313131',
            webPreferences: {
              nodeIntegration: true,
              webSecurity: false
            }
        });

        let indexURL = url.format({
          pathname: path.join(__dirname, `/../../dist/sygnaller/index.html`),
          protocol: "file:",
          slashes: true
        });

        if (process.argv.includes('live')) {
          indexURL = 'http://localhost:4200/index.html';
        }

        Main.window.loadURL(indexURL);
        Main.window.on('closed', Main.onClose);
    }

    private static sendMessageToWindow(message, ...args) {
      if (Main.window) {
        Main.window.webContents.send(message, ...args)
      }
    }

    private static createApplicationMenu() {
      const template: MenuItemConstructorOptions[] = [
        {
          label: 'Project',
          submenu: [
            {
              label: 'Close project',
              click: () => Main.sendMessageToWindow('close-project')
            },
            {
              label: 'Rename project',
              click: () => Main.sendMessageToWindow('rename-project')
            },
            {
              label: 'Clear build cache',
              click: () => Main.sendMessageToWindow('clear-build-cache')
            },
            {
              type: 'separator'
            },
            {
              label: 'Build',
              accelerator: 'CommandOrControl+B',
              click: () => Main.sendMessageToWindow('build-project')
            },
            {
              label: 'Run',
              accelerator: 'CommandOrControl+Enter',
              click: () => Main.sendMessageToWindow('run-project')
            },
            {
              label: 'Run current file',
              accelerator: 'CommandOrControl+Shift+Enter',
              click: () => Main.sendMessageToWindow('run-file')
            }
          ]
        },

        {
          label: 'Edit',
          submenu: [
            {
              role: 'undo'
            },
            {
              role: 'redo'
            },
            {
              type: 'separator'
            },
            {
              role: 'cut'
            },
            {
              role: 'copy'
            },
            {
              role: 'paste'
            }
          ]
        },

        {
          label: 'View',
          submenu: [
            {
              label: 'Dark mode',
              click: () => Main.sendMessageToWindow('dark-mode')
            },
            {
              label: 'Light mode',
              click: () => Main.sendMessageToWindow('light-mode')
            }
          ]
        },

        {
          role: 'window',
          submenu: [
            {
              role: 'minimize'
            },
            {
              role: 'close'
            }
          ]
        }
      ];
      if (process.platform === 'darwin') {
        template.unshift({
          label: 'Sygnaller',
          submenu: [
            {role: 'about'},
            {type: 'separator'},
            {role: 'services', submenu: []},
            {type: 'separator'},
            {role: 'hide'},
            {role: 'hideothers'},
            {role: 'unhide'},
            {type: 'separator'},
            {role: 'reload'},
            {role: 'toggledevtools'},
            {type: 'separator'},
            {role: 'quit'}
          ]
        });
        template.push({
          role: 'help',
          submenu: [
          ]
        });
      } else {
        template.unshift({
          label: 'Sygnaller',
          submenu: [
            {role: 'about'},
            {type: 'separator'},
            {role: 'reload'},
            {role: 'toggledevtools'},
            {type: 'separator'},
            {role: 'quit'}
          ]
        })
      }
      const menu = Menu.buildFromTemplate(template);
      Menu.setApplicationMenu(menu);
    }

    static main(app: Electron.App) {
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('activate', Main.onActivate);
        Main.application.on('ready', Main.onReady);
    }
}
