import { Ractive } from '../Ractive';

export default function Ractive$toText(this: Ractive): string {
  return this.fragment.toString(false);
}
