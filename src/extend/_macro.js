import styleGet from "../Ractive/static/styleGet";
import styleSet from "../Ractive/static/styleSet";
import CSSModel from "src/model/specials/CSSModel";
import { assign, create, defineProperties, defineProperty } from "utils/object";
import { isFunction } from "utils/is";

import { initCSS } from "src/Ractive/config/custom/css/css";

export default function macro(fn, opts) {
  if (!isFunction(fn)) throw new Error(`The macro must be a function`);

  assign(fn, opts);

  defineProperties(fn, {
    extensions: { value: [] },
    _cssIds: { value: [] },
    cssData: { value: assign(create(this.cssData), fn.cssData || {}) },

    styleGet: { value: styleGet.bind(fn) },
    styleSet: { value: styleSet.bind(fn) }
  });

  defineProperty(fn, "_cssModel", { value: new CSSModel(fn) });

  if (fn.css) initCSS(fn, fn, fn);

  this.extensions.push(fn);

  return fn;
}
