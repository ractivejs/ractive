export default function Viewmodel$clearCache ( keypath, keepExistingWrapper ) {
	var cacheMap, wrapper, keypathStr;
	keypath = keypath || this.rootKeypath;
	keypathStr = keypath.str;

	if ( !keepExistingWrapper ) {
		// Is there a wrapped property at this keypath?
		if ( wrapper = keypath.wrapper ) {
			// Did we unwrap it?
			if ( wrapper.teardown() !== false ) {
				// Is this right?
				// What's the meaning of returning false from teardown?
				// Could there be a GC ramification if this is a "real" ractive.teardown()?
				keypath.wrapper = null;
			}
		}
	}

	this.cache[ keypathStr ] = undefined;

	if ( cacheMap = this.cacheMap[ keypathStr ] ) {
		while ( cacheMap.length ) {
			this.clearCache( cacheMap.pop() );
		}
	}
}
