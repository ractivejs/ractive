import CSSModel from 'model/specials/CSSModel';
import { splitKeypath } from 'shared/keypaths';
import { addCSS, applyCSS } from 'src/global/css';
import type { Static } from 'src/Ractive/RactiveDefinition';
import type { CssFn } from 'types/Generic';
import type { ExtendOpts, InitOpts } from 'types/InitOptions';
import { getElement } from 'utils/dom';
import { uuid } from 'utils/id';
import { isString, isFunction, isObjectType } from 'utils/is';
import { warnIfDebug } from 'utils/log';
import { assign, create, defineProperty } from 'utils/object';

import type { Configurator } from '../../config';

import transformCss from './transform';

// TODO complete refactor

const hasCurly = /\{/;

export interface CSSDefinition {
  transform: boolean;
  styles?: string;
  applied?: boolean;
  id?: string;
}

const cssConfigurator: Configurator = {
  name: 'css',

  // Called when creating a new component definition
  extend: (Parent, proto, options, Child) => {
    Child._cssIds = gatherIds(Parent);

    defineProperty(Child, 'cssData', {
      configurable: true,
      value: assign(create(Parent.cssData), options.cssData || {})
    });

    defineProperty(Child, '_cssModel', {
      configurable: true,
      value: new CSSModel(Child)
    });

    if (options.css) initCSS(options, Child, proto);
  },

  // Called when creating a new component instance
  init: (_Parent, _target, options: InitOpts & { css?: string }): void => {
    if (!options.css) return;

    warnIfDebug(`
The css option is currently not supported on a per-instance basis and will be discarded. Instead, we recommend instantiating from a component definition with a css option.

const Component = Ractive.extend({
	...
	css: '/* your css */',
	...
});

const componentInstance = new Component({ ... })
		`);
  }
};
export default cssConfigurator;

function gatherIds(start: typeof Static): string[] {
  let cmp = start;
  const ids: string[] = [];

  while (cmp) {
    if (cmp.prototype.cssId) ids.push(cmp.prototype.cssId);
    cmp = cmp.Parent;
  }

  return ids;
}

export function evalCSS(component: typeof Static, css: string | CssFn): string {
  if (isString(css)) return css;

  const cssData = component.cssData;
  const model = component._cssModel;
  const data = function data(path): string {
    return <string>model.joinAll(splitKeypath(path)).get();
  };
  data.__proto__ = cssData;

  const result = css.call(component, data);
  return isString(result) ? result : '';
}

export function initCSS(
  options: ExtendOpts & { css?: ExtendOpts['css'] | boolean },
  target: typeof Static,
  proto: Static
): void {
  let css =
    options.css === true
      ? ''
      : isString(options.css) && !hasCurly.test(options.css)
      ? getElement(options.css) || options.css
      : options.css;
  let cssProp: string | CssFn;

  const id = options.cssId || uuid();

  if (isObjectType<HTMLElement>(css)) {
    css = 'textContent' in css ? css.textContent : (<HTMLElement>css).innerHTML;
    cssProp = css;
  } else if (isFunction(css)) {
    cssProp = css;
    css = evalCSS(target, css);
  } else {
    cssProp = css;
  }

  const def: CSSDefinition = {
    // TODO remove `noCssTransform` code?
    transform: 'noCSSTransform' in options ? !options.noCSSTransform : !options.noCssTransform
  };

  defineProperty(target, '_cssDef', { configurable: true, value: def });

  defineProperty(target, 'css', {
    get() {
      return cssProp;
    },
    set(next) {
      cssProp = next;
      const css = evalCSS(target, cssProp);
      const styles = def.styles;
      def.styles = def.transform ? transformCss(css, id) : css;
      if (def.applied && styles !== def.styles) applyCSS(true);
    }
  });

  def.styles = def.transform ? transformCss(css, id) : css;
  def.id = proto.cssId = id;
  target._cssIds.push(id);

  addCSS(target._cssDef);
}
