import { hasOwn } from 'utils/object';
import { isString, isObjectType } from 'utils/is';
import { Keypath } from 'types/Keypath';
import { ValueMap } from 'types/ValueMap';

// TODO this is legacy. sooner we can replace the old adaptor API the better
/* istanbul ignore next */
function prefixKeypath(obj: ValueMap, prefix: string): ValueMap {
  const prefixed = {};

  if (!prefix) {
    return obj;
  }

  prefix += '.';

  for (const key in obj) {
    if (hasOwn(obj, key)) {
      prefixed[prefix + key] = obj[key];
    }
  }

  return prefixed;
}

type PrefixerFunction = (relativeKeypath: Keypath, value: any) => Keypath | ValueMap;

interface Prefixers {
  [key: string]: PrefixerFunction;
}
const prefixers: Prefixers = {};

export default function getPrefixer(rootKeypath: Keypath): PrefixerFunction {
  let rootDot: Keypath;

  if (!prefixers[rootKeypath]) {
    rootDot = rootKeypath ? rootKeypath + '.' : '';

    /* istanbul ignore next */
    prefixers[rootKeypath] = function(relativeKeypath: Keypath, value): Keypath | ValueMap {
      let obj: ValueMap;

      if (isString(relativeKeypath)) {
        obj = {};
        obj[rootDot + relativeKeypath] = value;
        return obj;
      }

      if (isObjectType(relativeKeypath)) {
        // 'relativeKeypath' is in fact a hash, not a keypath
        return rootDot ? prefixKeypath(relativeKeypath, rootKeypath) : relativeKeypath;
      }
    };
  }

  return prefixers[rootKeypath];
}