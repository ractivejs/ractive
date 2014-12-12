import { decodeKeypath } from 'shared/keypaths';
import FAILED_LOOKUP from 'viewmodel/prototype/get/FAILED_LOOKUP';


var empty = {};

export default function Viewmodel$get ( keypath, options = empty ) {
	var ractive = this.ractive,
		cache = this.cache,
		mapping,
		value,
		computation,
		wrapped,
		captureGroup;

	// capture the keypath, if we're inside a computation
	if ( options.capture && ( captureGroup = this.captureGroups[ this.captureGroups.length - 1 ] ) ) {
		if ( !~captureGroup.indexOf( keypath ) ) {
			captureGroup.push( keypath );
		}
	}

	if ( mapping = this.mappings[ keypath.split( '.' )[0] ] ) {
		return mapping.get( keypath, options );
	}

	if ( keypath[0] === '@' ) {
		return decodeKeypath( keypath );
	}

	if ( cache[ keypath ] === undefined ) {

		// Is this a computed property?
		if ( ( computation = this.computations[ keypath ] ) && !computation.bypass ) {
			value = computation.get();
			this.adapt( keypath, value );
		}

		// Is this a wrapped property?
		else if ( wrapped = this.wrapped[ keypath ] ) {
			value = wrapped.value;
		}

		// Is it the root?
		else if ( !keypath ) {
			this.adapt( '', ractive.data );
			value = ractive.data;
		}

		// No? Then we need to retrieve the value one key at a time
		else {
			value = retrieve( this, keypath );
		}

		cache[ keypath ] = value;
	} else {
		value = cache[ keypath ];
	}

	if ( !options.noUnwrap && ( wrapped = this.wrapped[ keypath ] ) ) {
		value = wrapped.get();
	}

	return value === FAILED_LOOKUP ? void 0 : value;
}

function retrieve ( viewmodel, keypath ) {

	var keys, key, parentKeypath, parentValue, cacheMap, value, wrapped;

	keys = keypath.split( '.' );
	key = keys.pop();
	parentKeypath = keys.join( '.' );

	parentValue = viewmodel.get( parentKeypath );

	if ( wrapped = viewmodel.wrapped[ parentKeypath ] ) {
		parentValue = wrapped.get();
	}

	if ( parentValue === null || parentValue === undefined ) {
		return;
	}

	// update cache map
	if ( !( cacheMap = viewmodel.cacheMap[ parentKeypath ] ) ) {
		viewmodel.cacheMap[ parentKeypath ] = [ keypath ];
	} else {
		if ( cacheMap.indexOf( keypath ) === -1 ) {
			cacheMap.push( keypath );
		}
	}

	// If this property doesn't exist, we return a sentinel value
	// so that we know to query parent scope (if such there be)
	if ( typeof parentValue === 'object' && !( key in parentValue ) ) {
		return viewmodel.cache[ keypath ] = FAILED_LOOKUP;
	}

	value = parentValue[ key ];

	// Do we have an adaptor for this value?
	viewmodel.adapt( keypath, value, false );

	// Update cache
	viewmodel.cache[ keypath ] = value;
	return value;
}
