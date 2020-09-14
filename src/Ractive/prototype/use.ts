import { PluginExtend } from 'types/Generic';

import { Ractive } from '../Ractive';

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
