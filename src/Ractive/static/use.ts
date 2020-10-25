import type { PluginExtend } from 'types/Generic';
import { isFunction } from 'utils/is';

import type { Ractive } from '../RactiveDefinition';

export default function use(this: typeof Ractive, ...plugins: PluginExtend[]): typeof Ractive {
  plugins.forEach(p => {
    if (isFunction(p)) {
      p({
        proto: this.prototype,
        Ractive: this.Ractive,
        instance: this
      });
    }
  });
  return this;
}
