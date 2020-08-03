import runloop from 'src/global/runloop';
import { localFragment } from 'src/shared/Context';
import { fatal } from 'utils/log';

import EventDirective, { RactiveEventInterface } from '../shared/EventDirective';

class DOMEvent implements RactiveEventInterface {
  private name: string;
  private owner: any;
  private handler;

  constructor(name: DOMEvent['name'], owner: DOMEvent['owner']) {
    if (name.indexOf('*') !== -1) {
      fatal(
        `Only component proxy-events may contain "*" wildcards, <${owner.name} on-${name}="..."/> is not valid`
      );
    }

    this.name = name;
    this.owner = owner;
    this.handler = null;
  }

  bind(): void {}

  render(directive: EventDirective): void {
    const name = this.name;

    const register = () => {
      const node = this.owner.node;

      this.owner.on(
        name,
        (this.handler = event => {
          return directive.fire({
            node,
            original: event,
            event,
            name
          });
        })
      );
    };

    if (name !== 'load') {
      // schedule events so that they take place after twoway binding
      runloop.scheduleTask(register, true);
    } else {
      // unless its a load event
      register();
    }
  }

  unbind(): void {}

  unrender(): void {
    if (this.handler) this.owner.off(this.name, this.handler);
  }
}

class CustomEvent implements RactiveEventInterface {
  private eventPlugin: any;
  private owner: any;
  private name: any;
  private handler: any;
  private args: any;

  constructor(
    eventPlugin: CustomEvent['eventPlugin'],
    owner: CustomEvent['owner'],
    name: CustomEvent['name'],
    args: CustomEvent['args']
  ) {
    this.eventPlugin = eventPlugin;
    this.owner = owner;
    this.name = name;
    this.args = args;

    this.handler = null;
  }

  bind(): void {}

  render(directive: EventDirective): void {
    runloop.scheduleTask(() => {
      const node = this.owner.node;

      localFragment.f = directive.up;
      this.handler = this.eventPlugin.apply(
        this.owner.ractive,
        [
          node,
          (event: any = {}) => {
            if (event.original) event.event = event.original;
            else event.original = event.event;

            event.name = this.name;
            event.node = event.node || node;
            return directive.fire(event);
          }
        ].concat(this.args || [])
      );
      localFragment.f = null;
    });
  }

  unbind(): void {}

  unrender(): void {
    this.handler.teardown();
  }
}

export { DOMEvent, CustomEvent };
