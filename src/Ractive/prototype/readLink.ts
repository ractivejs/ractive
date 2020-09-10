import LinkModel from 'model/LinkModel';
import Model from 'model/Model';
import { splitKeypath } from 'shared/keypaths';
import { ReadLinkOpts, ReadLinkResult } from 'types/MethodOptions';

import { Ractive } from '../Ractive';

export default function Ractive$readLink(
  this: Ractive,
  keypath: string,
  options: ReadLinkOpts = {}
): ReadLinkResult {
  const path = splitKeypath(keypath);

  if (this.viewmodel.has(path[0])) {
    let model = this.viewmodel.joinAll<LinkModel | Model>(path);

    if (!model.isLink) return;

    while ((model = 'target' in model && model.target) && options.canonical !== false) {
      if (!model.isLink) break;
    }

    if (model) return { ractive: model.root.ractive, keypath: model.getKeypath() };
  }
}
