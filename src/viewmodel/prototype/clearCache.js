export default function Viewmodel$clearCache ( keypath, dontTeardownWrapper ) {
	var cacheMap, wrapper, computation;

	if ( !dontTeardownWrapper ) {
		// Is there a wrapped property at this keypath?
		if ( wrapper = this.wrapped[ keypath ] ) {
			// Did we unwrap it?
			if ( wrapper.teardown() !== false ) {
				this.wrapped[ keypath ] = null;
			}
		}
	}

	if ( computation = this.computations[ keypath ] ) {
		computation.compute();
	}

	this.cache[ keypath ] = undefined;

	if ( cacheMap = this.cacheMap[ keypath ] ) {
		while ( cacheMap.length ) {
			this.clearCache( cacheMap.pop() );
		}
	}
}
