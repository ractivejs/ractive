import TemplateItemType from 'config/types';
import { TemplateModel } from 'parse/converters/templateItemDefinitions';
import Context from 'shared/Context';
import { splitKeypath } from 'shared/keypaths';
import { applyCSS } from 'src/global/css';
import runloop from 'src/global/runloop';
import parser from 'src/Ractive/config/runtime-parser';
import { MacroHandle, MacroFn } from 'types/Macro';
import { RactiveFake } from 'types/RactiveFake';
import { isArray, isFunction, isObjectType, isString } from 'utils/is';
import { warnOnceIfDebug, warnIfDebug } from 'utils/log';
import { assign, hasOwn, keys } from 'utils/object';

import Fragment, { FragmentOpts } from '../Fragment';

import Component from './Component';
import { BindingFlagOwner } from './element/BindingFlag';
import { DecoratorOwner } from './element/Decorator';
import getPartialTemplate from './partial/getPartialTemplate';
import { EventDirectiveOwner } from './shared/EventDirective';
import { MustacheContainer, MustacheOpts } from './shared/Mustache';

interface PartialOpts extends MustacheOpts {
  macro: Partial['macro'];
}

export default class Partial extends MustacheContainer
  implements DecoratorOwner, EventDirectiveOwner, BindingFlagOwner {
  public yielder: number;
  private macro: MacroFn;
  public container: RactiveFake;
  private component: Component;
  private refName: string;
  public fn: any;
  public fnTemplate: any;
  public last: any[];
  public _attrs: Record<string, Fragment>;
  public partial: any[];
  public name: string;
  public proxy: MacroHandle;
  public handle: Context;
  public dirtyTemplate: boolean;
  private externalChange: boolean;
  public updating: number;
  public dirtyAttrs: boolean;
  public initing: 0 | 1;

  constructor(options: PartialOpts) {
    super(options);

    const { template } = options;

    // yielder is a special form of partial that will later require special handling
    if (template.t === TemplateItemType.YIELDER) {
      this.yielder = 1;
    } else if (template.t === TemplateItemType.ELEMENT) {
      // this is a macro partial, complete with macro constructor
      // leaving this as an element will confuse up-template searches
      this.type = TemplateItemType.PARTIAL;
      this.macro = options.macro;
    }
  }

  bind(): void {
    const template = this.template;

    if (this.yielder) {
      // the container is the instance that owns this node
      this.container = this.up.ractive;
      this.component = this.container.component;
      this.containerFragment = this.up;

      // normal component
      if (this.component) {
        // yields skip the owning instance and go straight to the surrounding context
        this.up = this.component.up;

        // {{yield}} is equivalent to {{yield content}}
        if (!template.r && !template.x && !template.rx) this.refName = 'content';
      } else {
        // plain-ish instance that may be attached to a parent later
        this.fragment = new Fragment({
          owner: this,
          template: []
        });
        this.fragment.bind();
        return;
      }
    }

    // this is a macro/super partial
    if (this.macro) {
      this.fn = this.macro;
    } else {
      // this is a plain partial or yielder
      if (!this.refName) this.refName = template.r;

      // if the refName exists as a partial, this is a plain old partial reference where no model binding will happen
      if (this.refName) {
        partialFromValue(this, this.refName);
      }

      // this is a dynamic/inline partial
      if (!this.partial && !this.fn) {
        super.bind();
        if (this.model) partialFromValue(this, this.model.get());
      }
    }

    if (!this.partial && !this.fn) {
      warnOnceIfDebug(`Could not find template for partial '${this.name}'`);
    }

    createFragment(this, this.partial || []);

    // macro/super partial
    if (this.fn) initMacro(this);

    this.fragment.bind();
  }

  bubble(): void {
    if (!this.dirty) {
      this.dirty = true;

      if (this.yielder) {
        this.containerFragment.bubble();
      } else {
        this.up.bubble();
      }
    }
  }

  findNextNode(): HTMLElement {
    return (this.containerFragment || this.up).findNextNode(this);
  }

  handleChange(): void {
    this.dirtyTemplate = true;
    this.externalChange = true;
    this.bubble();
  }

  rebound(update): void {
    if (this._attrs) {
      keys(this._attrs).forEach(k => this._attrs[k].rebound(update));
    }
    super.rebound(update);
  }

  refreshAttrs(): void {
    keys(this._attrs).forEach(k => {
      this.handle.attributes[k] = !this._attrs[k].items.length || this._attrs[k].valueOf();
    });
  }

  resetTemplate(): boolean {
    if (this.fn && this.proxy) {
      // TSRChange - change 0 to null to avoid type conflict
      this.last = null;
      if (this.externalChange) {
        if (isFunction(this.proxy.teardown)) this.proxy.teardown();
        this.fn = this.proxy = null;
      } else {
        this.partial = this.fnTemplate;
        return true;
      }
    }

    this.partial = null;

    if (this.refName) {
      this.partial = getPartialTemplate(this.ractive, this.refName, this.up);
    }

    if (!this.partial && this.model) {
      partialFromValue(this, this.model.get());
    }

    if (!this.fn) {
      if (this.last && this.partial === this.last) return false;
      else if (this.partial) {
        this.last = this.partial;
        contextifyTemplate(this);
      }
    }

    this.unbindAttrs();

    if (this.fn) {
      initMacro(this);
      if (isFunction(this.proxy.render)) runloop.scheduleTask(() => this.proxy.render());
    } else if (!this.partial) {
      warnOnceIfDebug(`Could not find template for partial '${this.name}'`);
    }

    return true;
  }

  render(target, occupants): void {
    if (this.fn && this.fn._cssDef && !this.fn._cssDef.applied) applyCSS();

    this.fragment.render(target, occupants);

    if (this.proxy && isFunction(this.proxy.render)) this.proxy.render();
  }

  unbind(view?): void {
    this.fragment.unbind(view);

    this.unbindAttrs(view);

    super.unbind();
  }

  unbindAttrs(view?): void {
    if (this._attrs) {
      keys(this._attrs).forEach(k => {
        this._attrs[k].unbind(view);
      });
    }
  }

  unrender(shouldDestroy: boolean): void {
    if (this.proxy && isFunction(this.proxy.teardown)) this.proxy.teardown();

    this.fragment.unrender(shouldDestroy);
  }

  update(): void {
    const proxy = this.proxy;
    this.updating = 1;

    if (this.dirtyAttrs) {
      this.dirtyAttrs = false;
      keys(this._attrs).forEach(k => this._attrs[k].update());
      this.refreshAttrs();
      if (isFunction(proxy.update)) proxy.update(this.handle.attributes);
    }

    if (this.dirtyTemplate) {
      this.dirtyTemplate = false;
      this.resetTemplate() && this.fragment.resetTemplate(this.partial || []);
    }

    if (this.dirty) {
      this.dirty = false;
      if (proxy && isFunction(proxy.invalidate)) proxy.invalidate();
      this.fragment.update();
    }

    this.externalChange = false;
    this.updating = 0;
  }
}

function createFragment(self: Partial, partial): void {
  self.partial = self.last = partial;
  contextifyTemplate(self);

  const options: FragmentOpts = {
    owner: self,
    template: self.partial
  };

  if (self.yielder) options.ractive = self.container.parent;

  if (self.fn) options.cssIds = self.fn._cssIds;

  self.fragment = new Fragment(options);
}

function contextifyTemplate(self: Partial): void {
  if (self.template.c) {
    self.partial = [
      { t: TemplateItemType.SECTION, n: TemplateItemType.SECTION_WITH, f: self.partial }
    ];
    assign(self.partial[0], self.template.c);
    if (self.yielder) self.partial[0].y = self;
    else self.partial[0].z = self.template.z;
  }
}

function partialFromValue(self, value, okToParse?) {
  let tpl = value;

  if (isArray(tpl)) {
    self.partial = tpl;
  } else if (tpl && isObjectType<any>(tpl)) {
    if (isArray(tpl.t)) self.partial = tpl.t;
    else if (isString(tpl.template))
      self.partial = parsePartial(tpl.template, tpl.template, self.ractive).t;
  } else if (isFunction(tpl) && tpl.styleSet) {
    self.fn = tpl;
    if (self.fragment) self.fragment.cssIds = tpl._cssIds;
  } else if (tpl != null) {
    tpl = getPartialTemplate(self.ractive, '' + tpl, self.containerFragment || self.up);
    if (tpl) {
      self.name = value;
      if (tpl.styleSet) {
        self.fn = tpl;
        if (self.fragment) self.fragment.cssIds = tpl._cssIds;
      } else self.partial = tpl;
    } else if (okToParse) {
      self.partial = parsePartial('' + value, '' + value, self.ractive).t;
    } else {
      self.name = value;
    }
  }

  return self.partial;
}

function setTemplate(this: Partial, template): Promise<void> {
  partialFromValue(this, template, true);

  if (!this.initing) {
    this.dirtyTemplate = true;
    this.fnTemplate = this.partial;

    if (this.updating) {
      this.bubble();
      runloop.promise();
    } else {
      const promise = runloop.start();

      this.bubble();
      runloop.end();

      return promise;
    }
  }
}

function aliasLocal(this: Context, ref: string, name: string): void {
  const aliases = this.fragment.aliases || (this.fragment.aliases = {});
  if (!name) {
    aliases[ref] = this._data;
  } else {
    aliases[name] = this._data.joinAll(splitKeypath(ref));
  }
}

const extras = 'extra-attributes';

function initMacro(self: Partial): void {
  const fn = self.fn;
  const fragment = self.fragment;

  // defensively copy the template in case it changes
  const template = (self.template = assign({}, self.template));
  const handle = (self.handle = fragment.getContext({
    proxy: self,
    aliasLocal,
    name: self.template.e || self.name,
    attributes: {},
    setTemplate: setTemplate.bind(self),
    template,
    macro: fn
  }));

  if (!template.p) template.p = {};
  template.p = handle.partials = assign({}, template.p);
  if (!hasOwn(template.p, 'content')) template.p.content = template.f || [];

  if (isArray(fn.attributes)) {
    self._attrs = {};

    const invalidate = function(): void {
      this.dirty = true;
      self.dirtyAttrs = true;
      self.bubble();
    };

    if (isArray(template.m)) {
      const attrs = template.m;
      template.p[extras] = template.m = attrs.filter(a => !~fn.attributes.indexOf(a.n));
      attrs
        .filter(a => ~fn.attributes.indexOf(a.n))
        .forEach(a => {
          const fragment = new Fragment({
            template: a.f,
            owner: self
          });
          fragment.bubble = invalidate;
          // TSRChange - removed since findFirstNode is not defined on fragment
          // fragment.findFirstNode = noop;
          self._attrs[a.n] = fragment;
        });
    } else {
      template.p[extras] = [];
    }
  } else {
    template.p[extras] = template.m;
  }

  if (self._attrs) {
    keys(self._attrs).forEach(k => {
      self._attrs[k].bind();
    });
    self.refreshAttrs();
  }

  self.initing = 1;
  self.proxy = fn.call(self.ractive, handle, handle.attributes) || {};
  if (!self.partial) self.partial = [];
  self.fnTemplate = self.partial;
  self.initing = 0;

  contextifyTemplate(self);
  fragment.resetTemplate(self.partial);
}

function parsePartial(name: string, partial: string, ractive: RactiveFake): TemplateModel {
  let parsed: TemplateModel;

  try {
    parsed = parser.parse<TemplateModel>(partial, parser.getParseOptions(ractive));
  } catch (e) {
    warnIfDebug(`Could not parse partial from expression '${name}'\n${e.message}`);
  }

  return parsed || { t: [] };
}
