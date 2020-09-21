import type { Ractive } from '../Ractive/RactiveDefinition';

export interface RactiveHTMLElement extends HTMLElement {
  _ractive?: Ractive;
  __ractive_instances__?: Ractive[];
}

export interface RactiveHTMLOptionElement extends HTMLOptionElement {
  _ractive?: Ractive;
}
