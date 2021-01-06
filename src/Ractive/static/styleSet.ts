import type CSSModel from 'model/specials/CSSModel';
import type { Keypath, ValueMap } from 'types/Generic';
import type { SetOpts } from 'types/MethodOptions';
import { isObjectType, isFunction } from 'utils/is';

import { applyCSS } from '../../global/css';
import runloop from '../../global/runloop';
import { build, set } from '../../shared/set';
import { evalCSS } from '../config/custom/css/css';
import transformCSS from '../config/custom/css/transform';
import type { Ractive, Static } from '../RactiveDefinition';

type SetCSSDataOpts = SetOpts & { apply: boolean };

function setCSSData(keypath: Keypath, value: unknown, options?: SetCSSDataOpts): Promise<void>;
function setCSSData(map: ValueMap, options?: SetCSSDataOpts): Promise<void>;
function setCSSData(
  keypath: Keypath | ValueMap,
  value: unknown | (SetOpts & { apply: boolean }),
  options?: SetOpts & { apply: boolean }
): Promise<void> {
  const opts = isObjectType(keypath) ? <SetCSSDataOpts>value : options;
  const model = <CSSModel>this._cssModel;

  model.locked = true;
  const promise = set(
    build(({ viewmodel: model } as unknown) as Ractive, keypath, value, true),
    opts
  );
  model.locked = false;

  const cascade = runloop.start();
  this.extensions.forEach(e => {
    const model = e._cssModel;
    model.mark();
    model.downstreamChanged('', 1);
  });
  runloop.end();

  applyChanges(this, !opts || opts.apply !== false);

  return promise.then(() => cascade);
}

export default setCSSData;

export function applyChanges(component: typeof Static, apply: boolean): boolean {
  const local = recomputeCSS(component);
  const child = component.extensions
    .map(e => applyChanges(e, false))
    .reduce((a, c) => c || a, false);

  if (apply && (local || child)) {
    const def = component._cssDef;
    if (!def || (def && def.applied)) applyCSS(true);
  }

  return local || child;
}

export function recomputeCSS(component: typeof Static): true | undefined {
  const css = component.css;

  if (!isFunction(css)) return;

  const def = component._cssDef;
  const result = evalCSS(component, css);
  const styles = def.transform ? transformCSS(result, def.id) : result;

  if (def.styles === styles) return;

  def.styles = styles;

  return true;
}
