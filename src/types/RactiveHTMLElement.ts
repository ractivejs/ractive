import type { Ractive } from '../Ractive/RactiveDefinition';

interface RactiveHTMLElementProperties {
  _ractive?: Ractive;
  __ractive_instances__?: Ractive[];
}

export interface RactiveHTMLElement extends HTMLElement, RactiveHTMLElementProperties {}

export interface RactiveHTMLInputElement extends HTMLInputElement, RactiveHTMLElementProperties {}
export interface RactiveHTMLSelectElement extends HTMLSelectElement, RactiveHTMLElementProperties {}
export interface RactiveHTMLOptionElement extends HTMLOptionElement, RactiveHTMLElementProperties {}
