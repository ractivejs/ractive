import { badArguments } from "config/errors";
import { gather, set } from "shared/set";
import { isString } from "utils/is";

export default function Ractive$toggle(keypath, options) {
  if (!isString(keypath)) {
    throw new TypeError(badArguments);
  }

  return set(
    gather(this, keypath, null, options && options.isolated).map(m => [m, !m.get()]),
    options
  );
}
