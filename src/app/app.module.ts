import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {HttpClientModule} from "@angular/common/http";
import { IngredientComponent } from './components/ingredient/ingredient.component';
import {FormsModule} from "@angular/forms";
import { PotionComponent } from './components/potion/potion.component';
import { FilterPipe } from './pipes/filter.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule, MatExpansionModule, MatSidenavModule, MatToolbarModule} from "@angular/material";

@NgModule({
  declarations: [
    AppComponent,
    IngredientComponent,
    PotionComponent,
    FilterPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatButtonModule,
    MatExpansionModule,
    MatToolbarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
