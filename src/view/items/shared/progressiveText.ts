import { doc } from 'config/environment';
import Text from 'view/items/Text';

import Interpolator from '../Interpolator';

export type TextOccupant = globalThis.Text | HTMLParagraphElement;

export default function progressiveText(
  item: Interpolator | Text,
  target: HTMLElement,
  occupants: TextOccupant[],
  text: string
): void {
  if (occupants) {
    let [n] = occupants;
    if (n?.nodeType === Node.TEXT_NODE) {
      const idx = n.nodeValue.indexOf(text);
      occupants.shift();

      if (idx === 0) {
        if (n.nodeValue.length !== text.length) {
          // Check if the node is text is performed before
          occupants.unshift((n as globalThis.Text).splitText(text.length));
        }
      } else {
        n.nodeValue = text;
      }
    } else {
      n = item.node = doc.createTextNode(text);
      if (occupants[0]) {
        target.insertBefore(n, occupants[0]);
      } else {
        target.appendChild(n);
      }
    }

    item.node = n;
  } else {
    if (!item.node) item.node = doc.createTextNode(text);
    target.appendChild(item.node);
  }
}
