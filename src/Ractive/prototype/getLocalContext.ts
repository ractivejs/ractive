import { localFragment } from 'shared/Context';
import type { ContextHelper } from 'types/Context';

import type { Ractive } from '../RactiveDefinition';

export default function Ractive$getLocalContext(this: Ractive): ContextHelper {
  if (localFragment.f) return localFragment.f.getContext();
}
