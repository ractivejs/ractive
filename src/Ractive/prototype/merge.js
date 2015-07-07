import { isArray } from 'utils/is';
import { splitKeypath } from 'shared/keypaths';
import runloop from 'global/runloop';

let comparators = {};

function getComparator ( option ) {
	if ( !option ) return null; // use existing arrays
	if ( option === true ) return JSON.stringify;
	if ( typeof option === 'function' ) return option;

	if ( typeof option === 'string' ) {
		return comparators[ option ] || ( comparators[ option ] = thing => thing[ option ] );
	}

	throw new Error( 'If supplied, options.compare must be a string, function, or `true`' ); // TODO link to docs
}

export default function Ractive$merge ( keypath, array, options ) {
	const model = this.viewmodel.joinAll( splitKeypath( keypath ) );
	const promise = runloop.start( this, true );

	if ( array === model.value ) {
		throw new Error( 'You cannot merge an array with itself' ); // TODO link to docs
	} else if ( !isArray( model.value ) || !isArray( array ) ) {
		throw new Error( 'You cannot merge an array with a non-array' );
	}

	const comparator = getComparator( options && options.compare );
	model.merge( array, comparator );

	runloop.end();
	return promise;
}
