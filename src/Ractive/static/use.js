import { isFunction } from 'utils/is';

export default function use(...plugins) {
  plugins.forEach(p => {
    isFunction(p) &&
      p({
        proto: this.prototype,
        Ractive: this.Ractive,
        instance: this
      });
  });
  return this;
}
