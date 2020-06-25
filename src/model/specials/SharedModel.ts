import { base } from 'config/environment';
import { Adaptor } from 'types/Adaptor';
import { Keypath } from 'types/Keypath';

import Model from '../Model';

export const data = {};

export class SharedModel extends Model {
  public adaptors: Adaptor[];

  // TODO add ractive type
  constructor(value, name: string, ractive?) {
    super(null, `@${name}`);
    this.key = `@${name}`;
    this.value = value;
    this.isRoot = true;
    this.root = this;
    this.adaptors = [];
    this.ractive = ractive;
  }

  getKeypath(): Keypath {
    return this.key;
  }

  retrieve() {
    return this.value;
  }
}

export default new SharedModel(data, 'shared');

export const GlobalModel = new SharedModel(base, 'global');
