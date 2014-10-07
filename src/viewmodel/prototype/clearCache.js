export default function Viewmodel$clearCache ( keypath, dontTeardownWrapper ) {
	var cacheMap, wrapper;

	if ( !dontTeardownWrapper ) {
		// Is there a wrapped property at this keypath?
		if ( wrapper = this.wrapped[ keypath ] ) {
			// Did we unwrap it?
			if ( wrapper.teardown() !== false ) {
				// Is this right?
				// What's the meaning of returning false from teardown?
				// Could there be a GC ramification if this is a "real" ractive.teardown()?
				this.wrapped[ keypath ] = null;
			}
		}
	}

	this.cache[ keypath ] = undefined;

	if ( cacheMap = this.cacheMap[ keypath ] ) {
		while ( cacheMap.length ) {
			this.clearCache( cacheMap.pop() );
		}
	}
}
