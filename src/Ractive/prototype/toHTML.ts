import { Ractive } from '../Ractive';

export default function Ractive$toHTML(this: Ractive): string {
  return this.fragment.toString(true);
}
