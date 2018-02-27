import { build, set } from 'shared/set';
import { isObjectType } from 'utils/is';

export default function Ractive$set(keypath, value, options) {
	const ractive = this;

	const opts = isObjectType(keypath) ? value : options;

	return set(build(ractive, keypath, value, opts && opts.isolated), opts);
}
