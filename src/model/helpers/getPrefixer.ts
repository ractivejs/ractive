import { AdaptorPrefixer } from 'types/Adaptor';
import { ValueMap, Keypath } from 'types/Generic';
import { isString, isObjectType } from 'utils/is';
import { hasOwn } from 'utils/object';

// TODO this is legacy. sooner we can replace the old adaptor API the better
/* istanbul ignore next */
function prefixKeypath(obj: ValueMap, prefix: string): ValueMap {
  const prefixed: ValueMap = {};

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

interface Prefixers {
  [key: string]: AdaptorPrefixer;
}
const prefixers: Prefixers = {};

export default function getPrefixer(rootKeypath: Keypath): AdaptorPrefixer {
  let rootDot: Keypath;

  if (!prefixers[rootKeypath]) {
    rootDot = rootKeypath ? rootKeypath + '.' : '';

    /* istanbul ignore next */
    prefixers[rootKeypath] = function(relativeKeypath, value) {
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
