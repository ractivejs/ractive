import { build, set } from "../../shared/set";
import SharedModel from "../../model/specials/SharedModel";
import { isObjectType } from "utils/is";

export default function sharedSet(keypath, value, options) {
  const opts = isObjectType(keypath) ? value : options;
  const model = SharedModel;

  return set(build({ viewmodel: model }, keypath, value, true), opts);
}
