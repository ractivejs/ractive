export default function Viewmodel$applyChanges () {
	var changes = this.changes;

	if ( !changes.length ) {
		// TODO we end up here on initial render. Perhaps we shouldn't?
		return;
	}

	this.changes = [];
	this.root.notify( 'observers' );
	this.root.notify( 'views' );

	// Return a hash of keypaths to updated values
	return changes.reduce( ( hash, context ) => {
		hash[ context.getKeypath() ] = context.get();
		return hash;
	}, {} );
}
