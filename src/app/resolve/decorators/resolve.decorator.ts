import { ChangeDetectorRef, ComponentRef } from '@angular/core';
import { OutletContext, Router } from '@angular/router';
import { pluck, Subject, switchMap, takeUntil } from 'rxjs';
import { StaticInjectorService } from '../service/staticjector.service';
import { getCurrentOutlet } from './functions/get-current-outlet';
import { getRouteWithData } from './functions/get-route-with-data';

export function Decorator(name?: string, propagation = true) {
  return function (
    target: any,
    key: any,
    originalDescriptor?: TypedPropertyDescriptor<any>
  ): any {
    const router = StaticInjectorService.Injector.get(Router);
    const triger = new Subject();
    const destroyer = new Subject();
    const rootContextMap = (router as any).rootContexts.contexts as Map<
      string,
      OutletContext
    >;
    let routerData: any;
    let cdr: ChangeDetectorRef;
    let inited = false;
    let compRef: ComponentRef<any>;

    triger
      .pipe(
        switchMap(() => {
          const currentActivatedOutlet = getCurrentOutlet(
            rootContextMap,
            target.constructor
          );
          if (!currentActivatedOutlet)
            throw new Error('Component is not in router tree');
          const outlet: any = currentActivatedOutlet.outlet;
          const routeWithData = getRouteWithData(
            currentActivatedOutlet.route as any, // changes
            name || key,
            propagation
          );
          compRef = outlet.activated as ComponentRef<any>;
          cdr = compRef.injector.get(ChangeDetectorRef);

          compRef.onDestroy(() => {
            inited = false;
            destroyer.next(null);
          });
          return routeWithData.data.pipe(
            pluck(name || key),
            takeUntil(destroyer)
          );
        })
      )
      .subscribe({
        next: (data) => {
          target[key] = data;
          cdr.markForCheck();
        },
      });
    return {
      get() {
        if (!inited) {
          inited = true;
          triger.next(null);
        }
        return originalDescriptor
          ? originalDescriptor.get?.call(compRef.instance)
          : routerData;
      },
      set(value: any) {
        routerData = value;
        if (originalDescriptor) {
          originalDescriptor.set?.call(compRef.instance, routerData);
        }
      },
    };
  };
}
