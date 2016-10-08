import { isArray } from '../../utils/is';
import { splitKeypath } from '../../shared/keypaths';
import runloop from '../../global/runloop';

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

export function merge ( ractive, model, array, options ) {
	const promise = runloop.start( ractive, true );
	const value = model.get();
	if ( array === undefined ) array = value;

	if ( !isArray( value ) || !isArray( array ) ) {
		throw new Error( 'You cannot merge an array with a non-array' );
	}

	const comparator = getComparator( options && options.compare );
	model.merge( array, comparator );

	runloop.end();
	return promise;
}

export default function thisRactive$merge ( keypath, array, options ) {
	return merge( this, this.viewmodel.joinAll( splitKeypath( keypath ) ), array, options );
}
