import { ANCHOR, COMPONENT } from 'config/types';
import getFunction from 'shared/getFunction';
import { splitKeypath } from 'shared/keypaths';
import { findInViewHierarchy } from 'shared/registry';
import fireEvent from 'src/events/fireEvent';
import Context from 'src/shared/Context';
import { addToArray, removeFromArray } from 'utils/array';
import { isArray, isString } from 'utils/is';
import { warnIfDebug, warnOnceIfDebug } from 'utils/log';
import noop from 'utils/noop';

import resolveReference from '../../resolvers/resolveReference';
import RactiveEvent from '../component/RactiveEvent';
import { DOMEvent, CustomEvent } from '../element/ElementEvents';
import { resolveArgs, setupArgsFn } from '../shared/directiveArgs';

import findElement from './findElement';

const specialPattern = /^(event|arguments|@node|@event|@context)(\..+)?$/;
const dollarArgsPattern = /^\$(\d+)(\..+)?$/;

export default class EventDirective {
  constructor(options) {
    this.owner = options.owner || options.up.owner || findElement(options.up);
    this.element = this.owner.attributeByName ? this.owner : findElement(options.up, true);
    this.template = options.template;
    this.up = options.up;
    this.ractive = options.up.ractive;
    this.events = [];
  }

  bind() {
    // sometimes anchors will cause an unbind without unrender
    if (this.events.length) {
      this.events.forEach(e => e.unrender());
      this.events = [];
    }

    if (this.element.type === COMPONENT || this.element.type === ANCHOR) {
      this.template.n.forEach(n => {
        this.events.push(new RactiveEvent(this.element, n));
      });
    } else {
      let args;
      if ((args = this.template.a)) {
        const rs = args.r.map(r => {
          const model = resolveReference(this.up, r);
          return model ? model.get() : undefined;
        });
        try {
          // todo check if passing null as this is necessary for getFunction output
          // eslint-disable-next-line prefer-spread
          args = getFunction(args.s, rs.length).apply(null, rs);
        } catch (err) {
          args = null;
          warnIfDebug(
            `Failed to compute args for event on-${this.template.n.join('- ')}: ${err.message ||
              err}`
          );
        }
      }

      this.template.n.forEach(n => {
        const fn = findInViewHierarchy('events', this.ractive, n);
        if (fn) {
          this.events.push(new CustomEvent(fn, this.element, n, args));
        } else {
          this.events.push(new DOMEvent(n, this.element));
        }
      });
    }

    // method calls
    this.models = null;

    addToArray(this.element.events || (this.element.events = []), this);

    setupArgsFn(this, this.template);
    if (!this.fn) this.action = this.template.f;

    this.events.forEach(e => e.bind(this));
  }

  destroyed() {
    this.events.forEach(e => e.unrender());
  }

  fire(event, args = []) {
    const context =
      event instanceof Context && event.refire ? event : this.element.getContext(event);

    if (this.fn) {
      const values = [];

      const models = resolveArgs(this, this.template, this.up, {
        specialRef(ref) {
          const specialMatch = specialPattern.exec(ref);
          if (specialMatch) {
            // on-click="foo(event.node)"
            return {
              special: specialMatch[1],
              keys: specialMatch[2] ? splitKeypath(specialMatch[2].substr(1)) : []
            };
          }

          const dollarMatch = dollarArgsPattern.exec(ref);
          if (dollarMatch) {
            // on-click="foo($1)"
            return {
              special: 'arguments',
              keys: [dollarMatch[1] - 1].concat(
                dollarMatch[2] ? splitKeypath(dollarMatch[2].substr(1)) : []
              )
            };
          }
        }
      });

      if (models) {
        models.forEach(model => {
          if (!model) return values.push(undefined);

          if (model.special) {
            const which = model.special;
            let obj;

            if (which === '@node') {
              obj = this.element.node;
            } else if (which === '@event') {
              obj = event && event.event;
            } else if (which === 'event') {
              warnOnceIfDebug(
                `The event reference available to event directives is deprecated and should be replaced with @context and @event`
              );
              obj = context;
            } else if (which === '@context') {
              obj = context;
            } else {
              obj = args;
            }

            const keys = model.keys.slice();

            while (obj && keys.length) obj = obj[keys.shift()];
            return values.push(obj);
          }

          if (model.wrapper) {
            return values.push(model.wrapperValue);
          }

          values.push(model.get());
        });
      }

      // make event available as `this.event`
      const ractive = this.ractive;
      const oldEvent = ractive.event;

      ractive.event = context;
      const returned = this.fn.apply(ractive, values);
      let result = returned.pop();

      // Auto prevent and stop if return is explicitly false
      if (result === false) {
        const original = event ? event.original : undefined;
        if (original) {
          original.preventDefault && original.preventDefault();
          original.stopPropagation && original.stopPropagation();
        } else {
          warnOnceIfDebug(
            `handler '${this.template.n.join(
              ' '
            )}' returned false, but there is no event available to cancel`
          );
        }
      } else if (!returned.length && isArray(result) && isString(result[0])) {
        // watch for proxy events
        result = fireEvent(this.ractive, result.shift(), context, result);
      }

      ractive.event = oldEvent;

      return result;
    } else {
      return fireEvent(this.ractive, this.action, context, args);
    }
  }

  handleChange() {}

  render() {
    this.events.forEach(e => e.render(this));
  }

  toString() {
    return '';
  }

  unbind(view) {
    removeFromArray(this.element.events, this);
    this.events.forEach(e => e.unbind(view));
  }

  unrender() {
    this.events.forEach(e => e.unrender());
  }
}

const proto = EventDirective.prototype;
proto.firstNode = proto.rebound = proto.update = noop;
