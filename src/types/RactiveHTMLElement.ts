// TODO add ractive type typings

export class RactiveHTMLElement extends HTMLElement {
  public _ractive: any;
  public __ractive_instances__: any[];
}

export interface RactiveHTMLOptionElement extends HTMLOptionElement {
  _ractive?: any;
}
