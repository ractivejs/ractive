import { ELEMENT, PARTIAL, SECTION, SECTION_WITH, YIELDER } from 'config/types';
import { assign, create, hasOwn, keys } from 'utils/object';
import { isArray, isFunction, isObjectType, isString } from 'utils/is';
import noop from 'utils/noop';
import { MustacheContainer } from './shared/Mustache';
import Fragment from '../Fragment';
import getPartialTemplate from './partial/getPartialTemplate';
import { warnOnceIfDebug, warnIfDebug } from 'utils/log';
import parser from 'src/Ractive/config/runtime-parser';
import runloop from 'src/global/runloop';
import { applyCSS } from 'src/global/css';
import { splitKeypath } from 'shared/keypaths';

export default function Partial(options) {
  MustacheContainer.call(this, options);

  const tpl = options.template;

  // yielder is a special form of partial that will later require special handling
  if (tpl.t === YIELDER) {
    this.yielder = 1;
  } else if (tpl.t === ELEMENT) {
    // this is a macro partial, complete with macro constructor
    // leaving this as an element will confuse up-template searches
    this.type = PARTIAL;
    this.macro = options.macro;
  }
}

const proto = (Partial.prototype = create(MustacheContainer.prototype));

assign(proto, {
  constructor: Partial,

  bind() {
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
        MustacheContainer.prototype.bind.call(this);
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
  },

  bubble() {
    if (!this.dirty) {
      this.dirty = true;

      if (this.yielder) {
        this.containerFragment.bubble();
      } else {
        this.up.bubble();
      }
    }
  },

  findNextNode() {
    return (this.containerFragment || this.up).findNextNode(this);
  },

  handleChange() {
    this.dirtyTemplate = true;
    this.externalChange = true;
    this.bubble();
  },

  rebound(update) {
    if (this._attrs) {
      keys(this._attrs).forEach(k => this._attrs[k].rebound(update));
    }
    MustacheContainer.prototype.rebound.call(this, update);
  },

  refreshAttrs() {
    keys(this._attrs).forEach(k => {
      this.handle.attributes[k] = !this._attrs[k].items.length || this._attrs[k].valueOf();
    });
  },

  resetTemplate() {
    if (this.fn && this.proxy) {
      if (this.externalChange) {
        if (isFunction(this.proxy.teardown)) this.proxy.teardown();
        this.fn = this.proxy = null;
      } else {
        this.partial = this.fnTemplate;
        return true;
      }
    }

    const partial = this.partial;
    this.partial = null;

    if (this.refName) {
      this.partial = getPartialTemplate(this.ractive, this.refName, this.up);
    }

    if (!this.partial && this.model) {
      partialFromValue(this, this.model.get());
    }

    if (!this.fn && partial === this.partial) return false;

    this.unbindAttrs();

    if (this.fn) {
      initMacro(this);
      if (isFunction(this.proxy.render)) runloop.scheduleTask(() => this.proxy.render());
    } else if (!this.partial) {
      warnOnceIfDebug(`Could not find template for partial '${this.name}'`);
    }

    return true;
  },

  render(target, occupants) {
    if (this.fn && this.fn._cssDef && !this.fn._cssDef.applied) applyCSS();

    this.fragment.render(target, occupants);

    if (this.proxy && isFunction(this.proxy.render)) this.proxy.render();
  },

  unbind(view) {
    this.fragment.unbind(view);

    this.unbindAttrs(view);

    MustacheContainer.prototype.unbind.call(this, view);
  },

  unbindAttrs(view) {
    if (this._attrs) {
      keys(this._attrs).forEach(k => {
        this._attrs[k].unbind(view);
      });
    }
  },

  unrender(shouldDestroy) {
    if (this.proxy && isFunction(this.proxy.teardown)) this.proxy.teardown();

    this.fragment.unrender(shouldDestroy);
  },

  update() {
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
});

function createFragment(self, partial) {
  self.partial = partial;
  contextifyTemplate(self);

  const options = {
    owner: self,
    template: self.partial
  };

  if (self.yielder) options.ractive = self.container.parent;

  if (self.fn) options.cssIds = self.fn._cssIds;

  self.fragment = new Fragment(options);
}

function contextifyTemplate(self) {
  if (self.template.c) {
    self.partial = [{ t: SECTION, n: SECTION_WITH, f: self.partial, z: self.template.z }];
    assign(self.partial[0], self.template.c);
    if (self.yielder) self.partial[0].y = self;
  }
}

function partialFromValue(self, value, okToParse) {
  let tpl = value;

  if (isArray(tpl)) {
    self.partial = tpl;
  } else if (tpl && isObjectType(tpl)) {
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

function setTemplate(template) {
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

function aliasLocal(ref, name) {
  const aliases = this.fragment.aliases || (this.fragment.aliases = {});
  if (!name) {
    aliases[ref] = this._data;
  } else {
    aliases[name] = this._data.joinAll(splitKeypath(ref));
  }
}

const extras = 'extra-attributes';

function initMacro(self) {
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

    const invalidate = function() {
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
          fragment.findFirstNode = noop;
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

function parsePartial(name, partial, ractive) {
  let parsed;

  try {
    parsed = parser.parse(partial, parser.getParseOptions(ractive));
  } catch (e) {
    warnIfDebug(`Could not parse partial from expression '${name}'\n${e.message}`);
  }

  return parsed || { t: [] };
}
