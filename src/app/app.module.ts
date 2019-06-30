import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {HttpClientModule} from "@angular/common/http";
import { IngredientComponent } from './components/ingredient/ingredient.component';
import {FormsModule} from "@angular/forms";
import { PotionComponent } from './components/potion/potion.component';

@NgModule({
  declarations: [
    AppComponent,
    IngredientComponent,
    PotionComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
