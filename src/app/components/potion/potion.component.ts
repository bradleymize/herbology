import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IngredientService} from "../../services/ingredient.service";
import {LocalStorageService} from "../../services/local-storage.service";

@Component({
  selector: 'app-potion',
  templateUrl: './potion.component.html',
  styleUrls: ['./potion.component.scss']
})
export class PotionComponent implements OnInit {
  @Input() potion: any;
  @Input() vault: any;
  @Output() excessIngredients = new EventEmitter();
  ingredients = [];
  allIngredientsMissing = true;

  constructor(
    private ingredientService: IngredientService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit() {
    this.ingredientService.list().subscribe(data => {
      this.potion.ingredients.forEach(i => {
        let matchingIngredient = data.find(item => {
          return item.key === i.name;
        });
        if(matchingIngredient) {
          matchingIngredient.quantity = i.quantity;
          this.ingredients.push(matchingIngredient);
        }
      });
      //initial load
      this.calculateIngredientEfficiency(this.localStorageService.get());
    });
    //watch for changes
    this.localStorageService.ingredientCount$.subscribe(data => {
      this.calculateIngredientEfficiency(data);
    });
  }

  calculateIngredientEfficiency(ingredientCounts) {
    let mostCanMake = -1;
    let allIngredientsMissing = true;
    this.ingredients.forEach(i => {
      i.have = ingredientCounts[i.key];
      if(!i.have) {
        i.have = 0;
      }
      if(i.have > 0) {
        allIngredientsMissing = false;
      }
      i.canMake = Math.floor(i.have / i.quantity);
      if(mostCanMake < 0) {
        mostCanMake = i.canMake
      } else {
        mostCanMake = Math.min(mostCanMake, i.canMake);
      }
    });
    this.allIngredientsMissing = allIngredientsMissing;
    this.ingredients.forEach(i => {
      i.mostCanMake = mostCanMake;
      i.totalRequired = mostCanMake * i.quantity;
      i.canToss = Math.max(0, i.have - i.totalRequired);
    });
    this.excessIngredients.emit(this.ingredients);
  }
}
