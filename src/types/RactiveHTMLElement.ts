import { RactiveFake } from './RactiveFake';

export class RactiveHTMLElement extends HTMLElement {
  public _ractive: RactiveFake;
  public __ractive_instances__: RactiveFake[];
}

export interface RactiveHTMLOptionElement extends HTMLOptionElement {
  _ractive?: RactiveFake;
}
