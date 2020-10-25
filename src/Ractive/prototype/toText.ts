import type { Ractive } from '../RactiveDefinition';

export default function Ractive$toText(this: Ractive): string {
  return this.fragment.toString(false);
}
