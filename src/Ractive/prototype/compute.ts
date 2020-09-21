import type ComputationModel from 'model/Computation';
import { fireShuffleTasks } from 'model/ModelBase';
import type RootModel from 'model/RootModel';
import { splitKeypath } from 'shared/keypaths';
import runloop from 'src/global/runloop';
import type { InternalComputationDescription, Computation } from 'types/Computation';
import { isString, isFunction } from 'utils/is';

import type { Ractive } from '../RactiveDefinition';

export function compute(this: Ractive, path: string, computed: Computation): ComputationModel {
  let _computed: InternalComputationDescription;
  if (isString(computed) || isFunction(computed)) {
    _computed = { get: computed };
  } else {
    _computed = computed;
  }

  // This is a hack to avoid type error since these registry should store computation model
  this.computed[path] = _computed as ComputationModel;

  const keys = splitKeypath(path);
  if (!~path.indexOf('*')) {
    const last = keys.pop();
    return this.viewmodel.joinAll<RootModel>(keys).compute(last, _computed);
  } else {
    _computed.pattern = new RegExp(
      '^' +
        keys
          .map(k => k.replace(/\*\*/g, '(.+)').replace(/\*/g, '((?:\\\\.|[^\\.])+)'))
          .join('\\.') +
        '$'
    );
  }
}

export default function Ractive$compute(
  this: Ractive,
  path: string,
  computed: Computation
): Promise<void> {
  const promise = runloop.start();
  const comp = compute.call(this, path, computed);

  if (comp) {
    const keys = splitKeypath(path);
    if (keys.length === 1 && !comp.isReadonly) {
      comp.set(this.viewmodel.value[keys[0]]);
    }

    const first = keys.reduce((a, c) => a && a.childByKey[c], this.viewmodel);
    if (first) {
      first.rebind(comp, first, false);
      if (first.parent) delete first.parent.childByKey[first.key];
      fireShuffleTasks();
    }
  }

  runloop.end();

  return promise;
}
