
const SETTING_DARK_MODE = 'darkMode';

export class Workspace {
  static get darkMode() : boolean {
    let d = localStorage.getItem(SETTING_DARK_MODE);
    if (d) return d == 'true';
    return false;
  }

  static set darkMode(value: boolean) {
    localStorage.setItem(SETTING_DARK_MODE, value ? 'true' : 'false');
  }
}
