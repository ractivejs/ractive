export default function Viewmodel$applyChanges () {
	var changes = this.changes;

	if ( !changes.length ) {
		// TODO we end up here on initial render. Perhaps we shouldn't?
		return;
	}

	this.changes = [];

	// TODO:
	// // Pattern observers are a weird special case
	// upstreamChanges = getUpstreamChanges( changes, this.rootKeypath );
	// if ( this.patternObservers.length ) {
	// 	upstreamChanges.forEach( keypath => notifyPatternObservers( this, keypath, true ) );
	// 	changes.forEach( keypath => notifyPatternObservers( this, keypath ) );
	// }


	this.rootKeypath.notify( 'observers' );
	this.rootKeypath.notify( 'default' );

	// Return a hash of keypaths to updated values
	return changes.reduce( ( hash, keypath ) => {
		hash[ keypath.getKeypath() ] = keypath.get();
		return hash;
	}, {} );
}
