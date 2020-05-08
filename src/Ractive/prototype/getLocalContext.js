import { localFragment } from '../../shared/Context';
export default function getLocalContext() {
  if (localFragment.f) return localFragment.f.getContext();
}
