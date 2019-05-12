import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'dataUri'
})
export class DataUriPipe implements PipeTransform {

  constructor(private _sanitizer:DomSanitizer) { }

  transform(v:string) {
    return this._sanitizer.bypassSecurityTrustResourceUrl(v);
  }
}
