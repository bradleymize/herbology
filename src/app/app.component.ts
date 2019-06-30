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
  hidden = false;
  excessMap = {};

  constructor(
    private ingredientService: IngredientService,
    private potionService: PotionService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.ingredientCount = this.localStorageService.get();
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

  updateLocalStorage(event): void {
    this.ingredientCount[event.name] = event.value;
    this.localStorageService.save(this.ingredientCount);
  };

  processExcess(ingredientList): void {
    console.log(ingredientList);
    ingredientList.forEach(i => {
      if(i.canToss > 0) {
        if(!this.excessMap[i.name]) {
          //add more properties here if you want to filter on them
          this.excessMap[i.name] = {
            canToss: i.canToss,
            isGreenhouse: i.isGreenhouse,
            rarity: i.rarity
          };
        } else {
          this.excessMap[i.name] = Math.min(this.excessMap[i.name].canToss, i.canToss);
        }
      }
    });
  }
}
