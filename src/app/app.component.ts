import {Component, OnInit} from '@angular/core';
import {IngredientService} from "./services/ingredient.service";
import {PotionService} from "./services/potion.service";
import {LocalStorageService} from "./services/local-storage.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
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

  processExcess(ingredientList): void {
    ingredientList.forEach(i => {
      if(i.canToss > 0) {
        if(!this.excessMap[i.name]) {
          //add more properties here if you want to filter on them
          this.excessMap[i.name] = {
            canToss: i.canToss,
            isGreenhouse: i.isGreenhouse,
            rarity: i.rarity,
            mostCanMake: i.mostCanMake,
            canBeMade: i.mostCanMake > 0
          };
        } else {
          //TODO: Handle ingredients used in multiple recipes (e.g. Exstimulo potions), use Math.min?
          this.excessMap[i.name].canToss = i.canToss;
        }
      }
    });
  }
}
