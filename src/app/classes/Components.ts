
export interface ComponentSpec {
  moduleName: string;
  bindings: ComponentBinding[];
}

export interface ComponentBinding {
  portName: string;
  binding: string;
}

export class VerilogModule {
  constructor(public name: string) {}
  ports: VerilogPort[] = [];

  static extractFrom(sourceCode: string): VerilogModule[] {
    let regexModule = /module\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\);/sig;
    let regexPort = /(input|output)\s+(wire\s|reg\s)?\s*(\[([0-9]+)\s*:\s*([0-9]+)\]\s*)?([a-zA-Z_][a-zA-Z0-9_]*)/si;
    let regexIdentifier = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*$/si;

    let found = [];

    let m;
    while ((m = regexModule.exec(sourceCode))) {
      let module = new VerilogModule(m[1]);

      for (let arg of m[2].split(',')) {
        let m = regexPort.exec(arg);
        if (m) {
          module.ports.push({
            direction: m[1],
            size: m[4] ? Math.max(1,+m[4] - +m[5] + 1) : 1,
            name: m[6]
          });
        } else {
          let m = regexIdentifier.exec(arg);
          if (m) {
            if (module.ports.length > 0) {
              module.ports.push({
                direction: module.ports[module.ports.length - 1].direction,
                size: module.ports[module.ports.length - 1].size,
                name: m[1]
              });
            }
          }
        }
      }

      found.push(module);
    }

    return found;
  }
}

export interface VerilogPort {
  direction: string;
  size: number;
  name: string;
}
