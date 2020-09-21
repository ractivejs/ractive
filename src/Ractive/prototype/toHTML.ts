import type { Ractive } from '../RactiveDefinition';

export default function Ractive$toHTML(this: Ractive): string {
  return this.fragment.toString(true);
}
