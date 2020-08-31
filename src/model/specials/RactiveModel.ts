import ModelBase from 'model/ModelBase';
import { create } from 'utils/object';

import LinkModel, { Missing } from '../LinkModel';

import { SharedModel } from './SharedModel';

export default class RactiveModel extends SharedModel {
  constructor(ractive: RactiveModel['ractive']) {
    super(ractive, '@this');
    this.ractive = ractive;
  }

  joinKey(key: string): ModelBase {
    const model = super.joinKey(key);

    // TSRChange - `model instanceof LinkModel` -> was `!model.isLink`
    if ((key === 'root' || key === 'parent') && !(model instanceof LinkModel))
      return initLink(model, key);
    else if (key === 'data') return this.ractive.viewmodel;
    else if (key === 'cssData') return (this.ractive.constructor as any)._cssModel; // TODO remove this "workaround"

    return model;
  }
}

function initLink(model: RactiveModel, key: string): LinkModel {
  model.applyValue = function(value) {
    this.parent.value[key] = value;
    if (value && value.viewmodel) {
      this.link(value.viewmodel.getRactiveModel(), key);
      this._link.markedAll();
    } else {
      this.link(create(Missing), key);
      this._link.markedAll();
    }
  };

  if (key === 'root') {
    const mark = model.mark;
    model.mark = function(force) {
      if (this._marking) return;
      this._marking = true;
      mark.apply(this, force);
      this._marking = false;
    };
  }

  model.applyValue(model.parent.ractive[key], !!key);
  model._link.set = v => model.applyValue(v);
  model._link.applyValue = v => model.applyValue(v);

  return model._link;
}
