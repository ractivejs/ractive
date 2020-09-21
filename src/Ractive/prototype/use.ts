import type { PluginExtend } from 'types/Generic';

import type { Ractive } from '../RactiveDefinition';

export default function Ractive$use(this: Ractive, ...plugins: PluginExtend[]): typeof this {
  plugins.forEach(p => {
    p({
      proto: this,
      Ractive: this.constructor,
      instance: this
    });
  });
  return this;
}
