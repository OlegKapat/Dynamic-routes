import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticInjectorService } from './service/staticjector.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers:[StaticInjectorService]
})
export class ResolveModule {
  constructor(_: StaticInjectorService){}
 }
