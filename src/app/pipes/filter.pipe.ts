import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], filter: Object): any {
    console.log('Items to filter:', items);
    console.log('Filter: ', filter);
    if(!items || !filter) {
      return items;
    }
    let filteredItems = items;
    Object.keys(filter).forEach(key => {
      filteredItems = filteredItems.filter(item => {
        return item["value"][key] === filter[key];
      });
    });
    console.log('returning: ', filteredItems);
    return filteredItems;
  }

}
