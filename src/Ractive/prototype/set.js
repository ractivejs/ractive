import { build, set } from '../../shared/set';

export default function Ractive$set ( keypath, value ) {
	const ractive = this;

	return set( ractive, build( ractive, keypath, value ) );
}

