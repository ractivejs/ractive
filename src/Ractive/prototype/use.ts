import type { PluginInstance } from 'types/Generic';

import type { Ractive } from '../RactiveDefinition';

export default function Ractive$use(this: Ractive, ...plugins: PluginInstance[]): Ractive {
  plugins.forEach(p => {
    p({
      proto: this,
      Ractive: this.constructor,
      instance: this
    });
  });
  return this;
}
