import TemplateItemType from 'config/types';
import Model from 'model/Model';
import type { EventDirectiveTemplateItem } from 'parse/converters/element/elementDefinitions';
import Context from 'shared/Context';
import getFunction from 'shared/getFunction';
import { splitKeypath } from 'shared/keypaths';
import { findInViewHierarchy } from 'shared/registry';
import fireEvent from 'src/events/fireEvent';
import type { Ractive } from 'src/Ractive/RactiveDefinition';
import { addToArray, removeFromArray } from 'utils/array';
import { isArray, isString } from 'utils/is';
import { warnIfDebug, warnOnceIfDebug } from 'utils/log';
import type Fragment from 'view/Fragment';
import type ExpressionProxy from 'view/resolvers/ExpressionProxy';

import resolveReference from '../../resolvers/resolveReference';
import type Component from '../Component';
import RactiveEvent from '../component/RactiveEvent';
import type Element from '../Element';
import { DOMEvent, CustomEvent } from '../element/ElementEvents';
import { resolveArgs, setupArgsFn } from '../shared/directiveArgs';

import findElement from './findElement';
import type Item from './Item';

const specialPattern = /^(event|arguments|@node|@event|@context)(\..+)?$/;
const dollarArgsPattern = /^\$(\d+)(\..+)?$/;

export interface EventDirectiveOpts {
  owner?: EventDirective['owner'];
  template: EventDirective['template'];
  up: EventDirective['up'];
  ractive: EventDirective['up'];
}

/** Very very semantic */
export interface RactiveEventInterface {
  bind: (directive?: EventDirective) => void;
  render: (directive?: EventDirective) => void;
  unbind: () => void;
  unrender: () => void;
}

/** Section | Partial | Component | Select | Input | Element  */
export interface EventDirectiveOwner extends Item {
  attributeByName?: Record<string, Item>;
}

export default class EventDirective {
  private owner: Element | Component;
  private element: Element | Component;
  public template: EventDirectiveTemplateItem;
  public up: Fragment;
  private ractive: Ractive;
  private events: RactiveEventInterface[];

  public model: ExpressionProxy;
  public fn: Function;
  private action: string;

  constructor(options: EventDirectiveOpts) {
    this.owner = options.owner || options.up.owner || findElement(options.up);
    // TSRChange - changed check using in to avoid errors related to type (attributeByName is present in component and Element)
    this.element = 'attributeByName' in this.owner ? this.owner : findElement(options.up, true);
    this.template = options.template;
    this.up = options.up;
    this.ractive = options.up.ractive;
    this.events = [];
  }

  bind(): void {
    // sometimes anchors will cause an unbind without unrender
    if (this.events.length) {
      this.events.forEach(e => e.unrender());
      this.events = [];
    }

    if (
      this.element.type === TemplateItemType.COMPONENT ||
      this.element.type === TemplateItemType.ANCHOR
    ) {
      this.template.n.forEach(n => {
        this.events.push(new RactiveEvent(<Component>this.element, n));
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
            `Failed to compute args for event on-${this.template.n.join('- ')}: ${
              err.message || err
            }`
          );
        }
      }

      this.template.n.forEach(n => {
        const fn = findInViewHierarchy('events', this.ractive, n);
        if (fn) {
          this.events.push(new CustomEvent(fn, this.element as Element, n, args));
        } else {
          this.events.push(new DOMEvent(n, this.element as Element));
        }
      });
    }

    // TSRChange - removed it seems not used
    // method calls
    // this.models = null;

    addToArray(this.element.events || (this.element.events = []), this);

    setupArgsFn(this, this.template);
    if (!this.fn) {
      this.action = this.template.f as string;
    }

    this.events.forEach(e => e.bind(this));
  }

  destroyed(): void {
    this.events.forEach(e => e.unrender());
  }

  // Unable to find a good way to better define return type of this function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fire(event: Context | (Record<string, unknown> & { original?: Event }), args = []): any {
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
              keys: [
                // TSRChange - added number casting
                Number(dollarMatch[1]) - 1,
                ...(dollarMatch[2] ? splitKeypath(dollarMatch[2].substr(1)) : [])
              ]
            };
          }
        }
      });

      if (models) {
        models.forEach(model => {
          if (!model) return values.push(undefined);

          // TSRChange - replace `model.special` with in for type checking
          if ('special' in model) {
            const which = model.special;
            let obj;

            if (which === '@node') {
              obj = (this.element as Element).node;
            } else if (which === '@event') {
              obj = event?.event;
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

          // TSRChange - added instanceof condition
          if (model instanceof Model && model.wrapper) {
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
          original && original.preventDefault();
          original && original.stopPropagation();
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
      const out = fireEvent(this.ractive, this.action, context, args);
      return out;
    }
  }

  handleChange(): void {}

  render(): void {
    this.events.forEach(e => e.render(this));
  }

  toString(): string {
    return '';
  }

  unbind(): void {
    removeFromArray(this.element.events, this);
    this.events.forEach(e => e.unbind());
  }

  unrender(): void {
    this.events.forEach(e => e.unrender());
  }

  firstNode(): void {}
  rebound(): void {}
  update(): void {}
}

// TSRChange - move function inside body class
// const proto = EventDirective.prototype;
// proto.firstNode = proto.rebound = proto.update = noop;
