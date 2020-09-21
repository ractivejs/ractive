import Context from 'shared/Context';
import type { ObserverHandle } from 'types/Observer';

import type Component from '../Component';
import type EventDirective from '../shared/EventDirective';
import type { RactiveEventInterface } from '../shared/EventDirective';

export default class RactiveEvent implements RactiveEventInterface {
  private component: Component;
  private name: string;
  private handler: ObserverHandle;

  constructor(component: Component, name: string) {
    this.component = component;
    this.name = name;
    this.handler = null;
  }

  bind(directive: EventDirective): void {
    const ractive = this.component.instance;

    this.handler = ractive.on(this.name, (...args) => {
      // watch for reproxy
      if (args[0] instanceof Context) {
        const ctx = args.shift();
        ctx.component = ractive;
        directive.fire(ctx, args);
      } else {
        directive.fire({}, args);
      }

      // cancel bubbling
      return false;
    });
  }

  render(): void {}

  unbind(): void {
    this.handler.cancel();
  }

  unrender(): void {}
}
