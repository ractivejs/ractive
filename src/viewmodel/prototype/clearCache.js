export default function Viewmodel$clearCache ( keypath, dontTeardownWrapper ) {
	var ractive = this.ractive, clearAll, cacheMap, wrapper, computation;

	if ( keypath === undefined ) {
		// Clear everything
		Object.keys( this.cache ).forEach( keypath => this.clearCache( keypath ) );
		return;
	}

	if ( !dontTeardownWrapper ) {
		// Is there a wrapped property at this keypath?
		if ( wrapper = ractive._wrapped[ keypath ] ) {
			// Did we unwrap it?
			if ( wrapper.teardown() !== false ) {
				ractive._wrapped[ keypath ] = null;
			}
		}
	}

	if ( computation = ractive._computations[ keypath ] ) {
		computation.compute();
	}

	this.cache[ keypath ] = undefined;

	if ( cacheMap = this.cacheMap[ keypath ] ) {
		while ( cacheMap.length ) {
			this.clearCache( cacheMap.pop() );
		}
	}
}
