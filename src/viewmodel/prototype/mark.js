export default function Viewmodel$mark ( keypath, options ) {
	var computation, keypathStr;
	keypath = keypath || this.rootKeypath;
	keypathStr = keypath.str;

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

	// pass on keepExistingWrapper, if we can
	let keepExistingWrapper = options ? options.keepExistingWrapper : false;

	this.clearCache( keypathStr, keepExistingWrapper );

	if ( this.ready ) {
		this.onchange();
	}
}
