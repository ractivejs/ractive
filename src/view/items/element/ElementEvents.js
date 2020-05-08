import { fatal } from 'utils/log';
import runloop from 'src/global/runloop';
import { localFragment } from 'src/shared/Context';

class DOMEvent {
  constructor(name, owner) {
    if (name.indexOf('*') !== -1) {
      fatal(
        `Only component proxy-events may contain "*" wildcards, <${
          owner.name
        } on-${name}="..."/> is not valid`
      );
    }

    this.name = name;
    this.owner = owner;
    this.handler = null;
  }

  bind() {}

  render(directive) {
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

  unbind() {}

  unrender() {
    if (this.handler) this.owner.off(this.name, this.handler);
  }
}

class CustomEvent {
  constructor(eventPlugin, owner, name, args) {
    this.eventPlugin = eventPlugin;
    this.owner = owner;
    this.name = name;
    this.handler = null;
    this.args = args;
  }

  bind() {}

  render(directive) {
    runloop.scheduleTask(() => {
      const node = this.owner.node;

      localFragment.f = directive.up;
      this.handler = this.eventPlugin.apply(
        this.owner.ractive,
        [
          node,
          (event = {}) => {
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

  unbind() {}

  unrender() {
    this.handler.teardown();
  }
}

export { DOMEvent, CustomEvent };
