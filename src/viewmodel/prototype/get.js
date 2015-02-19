import { lastItem } from 'utils/array';
import FAILED_LOOKUP from './get/FAILED_LOOKUP';

var empty = {};

export default function Viewmodel$get ( keypath, options ) {
	var mapping,
		value,
		computation,
		wrapped,
		captureGroup,
		keypathStr = keypath.str;

	options = options || empty;

	// capture the keypath, if we're inside a computation
	if ( options.capture && ( captureGroup = lastItem( this.captureGroups ) ) ) {
		if ( !~captureGroup.indexOf( keypath ) ) {
			captureGroup.push( keypath );
		}
	}

	if ( mapping = this.mappings[ keypath.firstKey ] ) {
		return mapping.get( keypath, options );
	}

	if ( keypath.isSpecial ) {
		return keypath.getValue();
	}

	if ( !keypath.hasCachedValue ) {

		// Is this a computed property?
		if ( ( computation = this.computations[ keypathStr ] ) && !computation.bypass ) {
			value = computation.get();
			this.adapt( keypath, value );
		}

		// Is this a wrapped property?
		else if ( wrapped = keypath.wrapper ) {
			value = wrapped.value;
		}

		// Is it the root?
		else if ( keypath.isRoot ) {
			this.adapt( keypath, this.data );
			value = this.data;
		}

		// No? Then we need to retrieve the value one key at a time
		else {
			value = retrieve( this, keypath );
		}

		keypath.setValue( value );
	} else {
		value = keypath.getValue();
	}

	if ( !options.noUnwrap && ( wrapped = keypath.wrapper ) ) {
		value = wrapped.get();
	}

	return value === FAILED_LOOKUP ? void 0 : value;
}

function retrieve ( viewmodel, keypath ) {

	var parentValue, cacheMap, value, wrapped;

	parentValue = viewmodel.get( keypath.parent );

	if ( wrapped = keypath.parent.wrapper ) {
		parentValue = wrapped.get();
	}

	if ( parentValue === null || parentValue === undefined ) {
		return;
	}

	// If this property doesn't exist, we return a sentinel value
	// so that we know to query parent scope (if such there be)
	if ( typeof parentValue === 'object' && !( keypath.lastKey in parentValue ) ) {
		return FAILED_LOOKUP;
	}

	value = parentValue[ keypath.lastKey ];

	// Do we have an adaptor for this value?
	viewmodel.adapt( keypath, value, false );

	return value;
}
