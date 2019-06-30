import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private LOCAL_STORAGE_INGREDIENT_KEY = 'ingredientCount';
  private LOCAL_STORAGE_INGREDIENTS_HIDDEN = 'hideIngredients';
  private LOCAL_STORAGE_POTIONS_HIDDEN = 'hidePotions';
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

  getIngredientVisibility(): boolean {
    let persistedData = localStorage.getItem(this.LOCAL_STORAGE_INGREDIENTS_HIDDEN);
    if(persistedData) {
      return JSON.parse(persistedData);
    } else {
      return false;
    }
  }

  saveIngredientVisibility(visibility: boolean): void {
    localStorage.setItem(this.LOCAL_STORAGE_INGREDIENTS_HIDDEN, JSON.stringify(visibility));
  }

  getPotionVisibility(): boolean {
    let persistedData = localStorage.getItem(this.LOCAL_STORAGE_POTIONS_HIDDEN);
    if(persistedData) {
      return JSON.parse(persistedData);
    } else {
      return false;
    }
  }

  savePotionVisibility(visibility: boolean): void {
    localStorage.setItem(this.LOCAL_STORAGE_POTIONS_HIDDEN, JSON.stringify(visibility));
  }
}
