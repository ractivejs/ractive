export default function Viewmodel$applyChanges () {
	var changes = this.changes;

	if ( !changes.length ) {
		// TODO we end up here on initial render. Perhaps we shouldn't?
		return;
	}

/* recent merge changes. delete once confirmed nothing new

	function invalidateComputation ( computation ) {
		var key = computation.key;

		if ( computation.viewmodel === self ) {
			self.clearCache( key.str );
			computation.invalidate();

			changes.push( key );
			cascade( key );
		} else {
			computation.viewmodel.mark( key );
		}
	}

	function cascade ( keypath ) {
		var map, computations;

		if ( self.noCascade.hasOwnProperty( keypath.str ) ) {
			return;
		}

		if ( computations = self.deps.computed[ keypath.str ] ) {
			computations.forEach( invalidateComputation );
		}

		if ( map = self.depsMap.computed[ keypath.str ] ) {
			map.forEach( cascade );
		}
	}

	changes.slice().forEach( cascade );

	upstreamChanges = getUpstreamChanges( changes );
	upstreamChanges.forEach( keypath => {
		var computations;

		// make sure we haven't already been down this particular keypath in this turn
		if ( changes.indexOf( keypath ) === -1 && ( computations = self.deps.computed[ keypath.str ] ) ) {
			computations.forEach( invalidateComputation );
		}
	});

*/
	this.changes = [];

	// TODO:
	// // Pattern observers are a weird special case
	// upstreamChanges = getUpstreamChanges( changes, this.root );
	// if ( this.patternObservers.length ) {
	// 	upstreamChanges.forEach( keypath => notifyPatternObservers( this, keypath, true ) );
	// 	changes.forEach( keypath => notifyPatternObservers( this, keypath ) );
	// }


	this.root.notify( 'observers' );
	this.root.notify( 'default' );

	// Return a hash of keypaths to updated values
	return changes.reduce( ( hash, keypath ) => {
		hash[ keypath.getKeypath() ] = keypath.get();
		return hash;
	}, {} );
}
