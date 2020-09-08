import { localFragment } from 'shared/Context';
import { ContextHelper } from 'types/Context';

import { Ractive } from '../Ractive';

export default function Ractive$getLocalContext(this: Ractive): ContextHelper {
  if (localFragment.f) return localFragment.f.getContext();
}
