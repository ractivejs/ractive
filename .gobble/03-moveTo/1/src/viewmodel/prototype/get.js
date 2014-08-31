define(['viewmodel/prototype/get/FAILED_LOOKUP','viewmodel/prototype/get/UnresolvedImplicitDependency'],function (FAILED_LOOKUP, UnresolvedImplicitDependency) {

	'use strict';
	
	var __export;
	
	var empty = {};
	
	__export = function Viewmodel$get ( keypath ) {var options = arguments[1];if(options === void 0)options = empty;
		var ractive = this.ractive,
			cache = this.cache,
			value,
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
	
		if ( options.evaluateWrapped && ( wrapped = this.wrapped[ keypath ] ) ) {
			value = wrapped.get();
		}
	
		// capture the keypath, if we're inside a computation or evaluator
		if ( options.capture && this.capturing && this.captured.indexOf( keypath ) === -1 ) {
			this.captured.push( keypath );
	
			// if we couldn't resolve the keypath, we need to make it as a failed
			// lookup, so that the evaluator updates correctly once we CAN
			// resolve the keypath
			if ( value === FAILED_LOOKUP && ( this.unresolvedImplicitDependencies[ keypath ] !== true ) ) {
				new UnresolvedImplicitDependency( this, keypath );
			}
		}
	
		return value === FAILED_LOOKUP ? void 0 : value;
	};
	
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
	return __export;

});