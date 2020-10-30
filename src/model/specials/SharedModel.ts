import { base } from 'config/environment';
import type { Adaptor } from 'types/Adaptor';
import type { Keypath } from 'types/Generic';

import Model from '../Model';

export const data = {};

/**
 * ### Dependencies
 * - ExpressionProxy
 */
export class SharedModel extends Model {
  public adaptors: Adaptor[];

  constructor(
    value: SharedModel['value'],
    name: SharedModel['key'],
    ractive?: SharedModel['ractive']
  ) {
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

  retrieve(): SharedModel['value'] {
    return this.value;
  }
}

export default new SharedModel(data, 'shared');

export const GlobalModel = new SharedModel(base, 'global');
