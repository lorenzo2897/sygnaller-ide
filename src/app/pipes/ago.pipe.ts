import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ago'
})
export class AgoPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value) {
      const seconds = Math.floor((+new Date() - +new Date(value * 1000)) / 1000);

      if (seconds < 60) { // up to 1 min
        return 'a few seconds ago';

      } else if (seconds < 120) { // up to 2 mins
        return '1 minute ago';

      } else if (seconds < 3600) { // up to 1 hour
        return Math.floor(seconds / 60) + ' minutes ago';

      } else if (seconds < 7200) { // up to 2 hours
        return '1 hour ago';

      } else if (seconds < 86400) { // up to a day
        return Math.floor(seconds / 3600) + ' hours ago';

      } else if (seconds < 2*86400) { // up to 2 days
        return '1 day ago';

      } else if (seconds < 14*86400) { // up to 2 weeks
        return Math.floor(seconds / 86400) + ' days ago';

      } else {
        return 'several weeks ago';
      }
    }
    return null;
  }

}
