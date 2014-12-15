import { decodeKeypath, getKey, getKeypath } from 'shared/keypaths';
import FAILED_LOOKUP from './get/FAILED_LOOKUP';


var empty = {};

export default function Viewmodel$get ( keypath, options ) {
	var ractive = this.ractive,
		cache = this.cache,
		mapping,
		value,
		computation,
		wrapped,
		captureGroup;

	options = options || empty;

	// TODO this is temporary. Eventually we should only use Keypath objects
	if ( typeof keypath === 'string' ) {
		keypath = getKeypath( keypath );
	}

	// capture the keypath, if we're inside a computation
	if ( options.capture && ( captureGroup = this.captureGroups[ this.captureGroups.length - 1 ] ) ) {
		if ( !~captureGroup.indexOf( keypath.str ) ) {
			captureGroup.push( keypath.str );
		}
	}

	if ( mapping = this.mappings[ keypath.firstKey ] ) {
		return mapping.get( keypath.str, options );
	}

	if ( keypath.isSpecial ) {
		return keypath.value;
	}

	if ( cache[ keypath ] === undefined ) {

		// Is this a computed property?
		if ( ( computation = this.computations[ keypath ] ) && !computation.bypass ) {
			value = computation.get();
			this.adapt( keypath.str, value );
		}

		// Is this a wrapped property?
		else if ( wrapped = this.wrapped[ keypath ] ) {
			value = wrapped.value;
		}

		// Is it the root?
		else if ( keypath.isRoot ) {
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

	var parentValue, cacheMap, value, wrapped;

	parentValue = viewmodel.get( keypath.parent );

	if ( wrapped = viewmodel.wrapped[ keypath.parent ] ) {
		parentValue = wrapped.get();
	}

	if ( parentValue === null || parentValue === undefined ) {
		return;
	}

	// update cache map
	if ( !( cacheMap = viewmodel.cacheMap[ keypath.parent.str ] ) ) {
		viewmodel.cacheMap[ keypath.parent.str ] = [ keypath.str ];
	} else {
		if ( cacheMap.indexOf( keypath.str ) === -1 ) {
			cacheMap.push( keypath.str );
		}
	}

	// If this property doesn't exist, we return a sentinel value
	// so that we know to query parent scope (if such there be)
	if ( typeof parentValue === 'object' && !( keypath.lastKey in parentValue ) ) {
		return viewmodel.cache[ keypath ] = FAILED_LOOKUP;
	}

	value = parentValue[ keypath.lastKey ];

	// Do we have an adaptor for this value?
	viewmodel.adapt( keypath.str, value, false );

	// Update cache
	viewmodel.cache[ keypath ] = value;
	return value;
}
