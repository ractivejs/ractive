import hasOwnProperty from 'utils/hasOwnProperty';
import clone from 'utils/clone';
import adaptIfNecessary from 'shared/adaptIfNecessary';
import getFromParent from 'viewmodel/prototype/get/getFromParent';
import FAILED_LOOKUP from 'viewmodel/prototype/get/FAILED_LOOKUP';

export default function Viewmodel$get ( keypath, options ) {
	var ractive = this.ractive,
		cache = ractive._cache,
		value,
		firstKey,
		firstKeyDoesNotExist,
		computation,
		wrapped,
		evaluator;

	if ( cache[ keypath ] === undefined ) {

		// Is this a computed property?
		if ( computation = ractive._computations[ keypath ] ) {
			value = computation.value;
		}

		// Is this a wrapped property?
		else if ( wrapped = ractive._wrapped[ keypath ] ) {
			value = wrapped.value;
		}

		// Is it the root?
		else if ( !keypath ) {
			adaptIfNecessary( ractive, '', ractive.data );
			value = ractive.data;
		}

		// Is this an uncached evaluator value?
		else if ( evaluator = ractive._evaluators[ keypath ] ) {
			value = evaluator.value;
		}

		// No? Then we need to retrieve the value one key at a time
		else {
			value = retrieve( ractive, keypath );
		}

		cache[ keypath ] = value;
	} else {
		value = cache[ keypath ];
	}

	// If the property doesn't exist on this viewmodel, we
	// can try going up a scope. This will create bindings
	// between parent and child if possible
	if ( value === FAILED_LOOKUP ) {
		// Only do this if the first key of the keypath doesn't
		// exist on the child model. Otherwise missing properties
		// of objects that are NOT missing could be optimistically
		// bound to the wrong thing
		firstKey = keypath.split( '.' )[0];
		firstKeyDoesNotExist = ( firstKey === keypath ) || ractive.viewmodel.get( firstKey ) === undefined;

		if ( ractive._parent && !ractive.isolated && firstKeyDoesNotExist ) {
			value = getFromParent( ractive, keypath, options );
		} else {
			value = undefined;
		}
	}

	if ( options && options.evaluateWrapped && ( wrapped = ractive._wrapped[ keypath ] ) ) {
		value = wrapped.get();
	}

	return value;
}

function retrieve ( ractive, keypath ) {
	var keys, key, parentKeypath, parentValue, cacheMap, value, wrapped, shouldClone;

	keys = keypath.split( '.' );
	key = keys.pop();
	parentKeypath = keys.join( '.' );

	parentValue = ractive.viewmodel.get( parentKeypath );

	if ( wrapped = ractive._wrapped[ parentKeypath ] ) {
		parentValue = wrapped.get();
	}

	if ( parentValue === null || parentValue === undefined ) {
		return;
	}

	// update cache map
	if ( !( cacheMap = ractive._cacheMap[ parentKeypath ] ) ) {
		ractive._cacheMap[ parentKeypath ] = [ keypath ];
	} else {
		if ( cacheMap.indexOf( keypath ) === -1 ) {
			cacheMap.push( keypath );
		}
	}

	// If this property doesn't exist, we return a sentinel value
	// so that we know to query parent scope (if such there be)
	if ( typeof parentValue === 'object' && !( key in parentValue ) ) {
		return ractive._cache[ keypath ] = FAILED_LOOKUP;
	}

	// If this value actually lives on the prototype of this
	// instance's `data`, and not as an own property, we need to
	// clone it. Otherwise the instance could end up manipulating
	// data that doesn't belong to it
	// TODO shouldn't we be using prototypal inheritance instead?
	shouldClone = !hasOwnProperty.call( parentValue, key );
	value = shouldClone ? clone( parentValue[ key ] ) : parentValue[ key ];

	// Do we have an adaptor for this value?
	value = adaptIfNecessary( ractive, keypath, value, false );

	// Update cache
	ractive._cache[ keypath ] = value;
	return value;
}
