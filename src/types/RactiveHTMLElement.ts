import { Ractive } from '../Ractive/Ractive';

export class RactiveHTMLElement extends HTMLElement {
  public _ractive: Ractive;
  public __ractive_instances__: Ractive[];
}

export interface RactiveHTMLOptionElement extends HTMLOptionElement {
  _ractive?: Ractive;
}
