import getFromParent from 'viewmodel/prototype/get/getFromParent';
import FAILED_LOOKUP from 'viewmodel/prototype/get/FAILED_LOOKUP';
import UnresolvedImplicitDependency from 'viewmodel/prototype/get/UnresolvedImplicitDependency';

var empty = {};

export default function Viewmodel$get ( keypath, options = empty ) {
	var ractive = this.ractive,
		cache = this.cache,
		value,
		firstKey,
		firstKeyDoesNotExist,
		computation,
		wrapped,
		evaluator;

	if ( cache[ keypath ] === undefined ) {

		// Is this a computed property?
		if ( computation = this.computations[ keypath ] ) {
			value = computation.value;
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

		// Is this an uncached evaluator value?
		else if ( evaluator = this.evaluators[ keypath ] ) {
			value = evaluator.value;
		}

		// No? Then we need to retrieve the value one key at a time
		else {
			value = retrieve( this, keypath );
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
		firstKeyDoesNotExist = ( firstKey === keypath ) || this.get( firstKey ) === undefined;

		if ( ractive._parent && !ractive.isolated && firstKeyDoesNotExist ) {
			value = getFromParent( ractive, keypath, options );
		} else {
			value = undefined;
		}
	}

	if ( options.evaluateWrapped && ( wrapped = this.wrapped[ keypath ] ) ) {
		value = wrapped.get();
	}

	// capture the keypath, if we're inside a computation or evaluator
	if ( options.capture && this.capturing && this.captured.indexOf( keypath ) === -1 ) {
		this.captured.push( keypath );

		// if we couldn't resolve the keypath, we need to make it as a failed
		// lookup, so that the evaluator updates correctly once we CAN
		// resolve the keypath
		if ( value === undefined && ( this.unresolvedImplicitDependencies[ keypath ] !== true ) ) {
			new UnresolvedImplicitDependency( this, keypath );
		}
	}

	return value;
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
