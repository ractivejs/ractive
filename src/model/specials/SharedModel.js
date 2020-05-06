import Model from '../Model';
import { base } from 'config/environment';

export const data = {};

export class SharedModel extends Model {
  constructor(value, name, ractive) {
    super(null, `@${name}`);
    this.key = `@${name}`;
    this.value = value;
    this.isRoot = true;
    this.root = this;
    this.adaptors = [];
    this.ractive = ractive;
  }

  getKeypath() {
    return this.key;
  }

  retrieve() {
    return this.value;
  }
}

export default new SharedModel(data, 'shared');

export const GlobalModel = new SharedModel(base, 'global');
