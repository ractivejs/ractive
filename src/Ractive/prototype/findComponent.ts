import { FindOpts } from 'src/types/Options';
import { isObjectType } from 'utils/is';

import { Ractive } from '../Ractive';

// TODO add this as Ractive
function Ractive$findComponent(this: Ractive, opts?: FindOpts): Ractive;
function Ractive$findComponent(this: Ractive, name: string, opts?: FindOpts): Ractive;
function Ractive$findComponent(
  this: Ractive,
  name: string | FindOpts,
  options: FindOpts = {}
): Ractive {
  if (isObjectType<FindOpts>(name)) {
    options = name;
    name = '';
  }

  let child = this.fragment.findComponent(name, options);
  if (child) return child;

  if (options.remote) {
    if (!name && this._children.length) return this._children[0].instance;
    for (let i = 0; i < this._children.length; i++) {
      // skip children that are or should be in an anchor
      if (this._children[i].target) continue;
      if (this._children[i].name === name) return this._children[i].instance;
      child = this._children[i].instance.findComponent(name, options);
      if (child) return child;
    }
  }
}

export default Ractive$findComponent;
