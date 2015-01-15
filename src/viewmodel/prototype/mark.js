import runloop from 'global/runloop';

export default function Viewmodel$mark ( keypath, options ) {
	var computation, keypathStr = keypath.str;

	runloop.addViewmodel( this ); // TODO remove other instances of this call

	// implicit changes (i.e. `foo.length` on `ractive.push('foo',42)`)
	// should not be picked up by pattern observers
	if ( options ) {
		if ( options.implicit ) {
			this.implicitChanges[ keypathStr ] = true;
		}
		if ( options.noCascade ) {
			this.noCascade[ keypathStr ] = true;
		}
	}

	if ( computation = this.computations[ keypathStr ] ) {
		computation.invalidate();
	}

	if ( this.changes.indexOf( keypath ) === -1 ) {
		this.changes.push( keypath );
	}

	// pass on teardownWrapper, if we can
	let teardownWrapper = options ? options.teardownWrapper : false;

	this.clearCache( keypathStr, teardownWrapper );
}
