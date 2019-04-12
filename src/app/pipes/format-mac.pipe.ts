import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatMac'
})
export class FormatMacPipe implements PipeTransform {

  transform(value: string, args?: any): any {
    if (/^[0-9a-f]{12}$/i.test(value)) {
      return value.match(/.{2}/g).join(':');
    }
    return value;
  }

}
