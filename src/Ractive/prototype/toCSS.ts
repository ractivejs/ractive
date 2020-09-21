import { getCSS } from 'src/global/css';
import { keys } from 'utils/object';

import { Ractive } from '../RactiveDefinition';

export default function Ractive$toCSS(this: Ractive): string {
  const cssIds = [this.cssId, ...this.findAllComponents().map(c => c.cssId)];
  // TODO consider to use Set to get unique items
  const uniqueCssIds = keys(cssIds.reduce((ids, id) => ((ids[id] = true), ids), {}));
  return getCSS(uniqueCssIds);
}
