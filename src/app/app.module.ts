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
import { TensorComponent } from './tensor/tensor.component';
import {AppRoutingModule} from "./app-routing.module";
import { IndexComponent } from './index/index.component';
import { ImageTestComponent } from './test/image-test/image-test.component';

@NgModule({
  declarations: [
    AppComponent,
    IngredientComponent,
    PotionComponent,
    FilterPipe,
    TensorComponent,
    IndexComponent,
    ImageTestComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
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
