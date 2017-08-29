import { build, set } from 'shared/set';

export default function Ractive$set ( keypath, value, options ) {
	const ractive = this;

	const opts = typeof keypath === 'object' ? value : options;

	return set( build( ractive, keypath, value, opts && opts.isolated ), opts );
}

