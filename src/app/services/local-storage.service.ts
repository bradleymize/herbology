import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private LOCAL_STORAGE_INGREDIENT_KEY = 'ingredientCount';
  private ingredientCountSource = new Subject<any>();
  ingredientCount$ = this.ingredientCountSource.asObservable();

  constructor() { }

  save(ingredientCount): void {
    delete ingredientCount[""];
    this.ingredientCountSource.next(ingredientCount);
    localStorage.setItem(this.LOCAL_STORAGE_INGREDIENT_KEY, JSON.stringify(ingredientCount));
  }

  get(): any {
    let persistedData = localStorage.getItem(this.LOCAL_STORAGE_INGREDIENT_KEY);
    if(persistedData) {
      return JSON.parse(persistedData);
    } else {
      return {};
    }
  }
}
