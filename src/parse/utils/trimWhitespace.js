import { lastItem } from "utils/array";
import { isString } from "utils/is";

export default function(items, leadingPattern, trailingPattern) {
  let item;

  if (leadingPattern) {
    item = items[0];
    if (isString(item)) {
      item = item.replace(leadingPattern, "");

      if (!item) {
        items.shift();
      } else {
        items[0] = item;
      }
    }
  }

  if (trailingPattern) {
    item = lastItem(items);
    if (isString(item)) {
      item = item.replace(trailingPattern, "");

      if (!item) {
        items.pop();
      } else {
        items[items.length - 1] = item;
      }
    }
  }
}
