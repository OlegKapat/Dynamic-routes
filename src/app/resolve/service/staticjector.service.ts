import { Injectable, Injector } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StaticInjectorService {
  static Injector: Injector

  constructor(injector: Injector) { 
    StaticInjectorService.Injector=injector
  }
}
