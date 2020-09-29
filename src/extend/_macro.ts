import CSSModel from 'model/specials/CSSModel';
import { initCSS } from 'src/Ractive/config/custom/css/css';
import type { Ractive, Static } from 'src/Ractive/RactiveDefinition';
import type { Macro, MacroFn, MacroOpts } from 'types/Macro';
import { isFunction } from 'utils/is';
import { assign, create, defineProperties, defineProperty } from 'utils/object';

import styleGet from '../Ractive/static/styleGet';
import styleSet from '../Ractive/static/styleSet';

export default function macro(this: Ractive, fn: MacroFn, opts: MacroOpts): Macro {
  if (!isFunction(fn)) throw new Error(`The macro must be a function`);

  const macro = <Macro>fn;

  assign(macro, opts);

  defineProperties(macro, {
    extensions: { value: [] },
    _cssIds: { value: [] },
    cssData: { value: assign(create(this.cssData), macro.cssData || {}) },

    styleGet: { value: styleGet.bind(macro) },
    styleSet: { value: styleSet.bind(macro) }
  });

  defineProperty(macro, '_cssModel', { value: new CSSModel(macro) });

  // TODO make the function support macro
  if (macro.css)
    initCSS(macro, (macro as unknown) as typeof Static, (macro as unknown) as typeof Static);

  this.extensions.push(macro);

  return macro;
}
