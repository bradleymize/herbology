import { Component, OnInit } from '@angular/core';
import {IngredientService} from "../services/ingredient.service";
import {PotionService} from "../services/potion.service";
import {LocalStorageService} from "../services/local-storage.service";

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  title = 'herbology';
  ingredients = [];
  potions = [];
  ingredientCount = {};
  hideIngredients = false;
  hidePotions = false;
  excessMap = {};

  constructor(
    private ingredientService: IngredientService,
    private potionService: PotionService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.ingredientCount = this.localStorageService.get();
    this.hideIngredients = this.localStorageService.getIngredientVisibility();
    this.hidePotions = this.localStorageService.getPotionVisibility();
    this.ingredientService.list().subscribe( data => {
      data.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      this.ingredients = data;
    });
    this.potionService.list().subscribe( data => {
      this.potions = data;
    });
  }

  increment(item): void {
    this.updateLocalStorage({
      name: item.key,
      value: this.ingredientCount[item.key] + 1
    });
  }

  updateLocalStorage(event): void {
    this.ingredientCount[event.name] = event.value;
    this.localStorageService.save(this.ingredientCount);
  };

  toggleIngredients(): void {
    this.hideIngredients = !this.hideIngredients;
    this.localStorageService.saveIngredientVisibility(this.hideIngredients);
  };

  togglePotions(): void {
    this.hidePotions = !this.hidePotions;
    this.localStorageService.savePotionVisibility(this.hidePotions);
  };

  totalIngredients(): any {
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    return Object.values(this.ingredientCount).reduce(reducer);
  }

  processExcess(ingredientList): void {
    ingredientList.forEach(i => {
      if(i.canToss > 0) {
        //TODO: Handle ingredients used in multiple recipes (e.g. Exstimulo potions), use Math.min?
        //add more properties here if you want to filter on them
        this.excessMap[i.name] = {
          canToss: i.canToss,
          isGreenhouse: i.isGreenhouse,
          rarity: i.rarity,
          mostCanMake: i.mostCanMake,
          canBeMade: i.mostCanMake > 0
        };
      } else {
        if(this.excessMap[i.name]) {
          delete this.excessMap[i.name];
        }
      }
    });
  }
}
