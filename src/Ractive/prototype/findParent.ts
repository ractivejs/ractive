import { Ractive } from '../Ractive';

export default function Ractive$findParent(this: Ractive, selector: string): Ractive {
  if (this.parent) {
    if (this.parent.component && this.parent.component.name === selector) {
      return this.parent;
    } else {
      return this.parent.findParent(selector);
    }
  }

  return null;
}
