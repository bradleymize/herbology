import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {TensorComponent} from "./tensor/tensor.component";
import {IndexComponent} from "./index/index.component";
import {ImageTestComponent} from "./test/image-test/image-test.component";

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'tensor', component: TensorComponent },
  { path: 'test', component: ImageTestComponent}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
