export default function Component$rebind ( oldKeypath, newKeypath ) {
	var query;

	this.resolvers.forEach( rebind );
	this.complexParameters.forEach( rebind );

	if ( this.yielders[0] ) {
		rebind( this.yielders[0] );
	}

	if ( query = this.root._liveComponentQueries[ '_' + this.name ] ) {
		query._makeDirty();
	}

	function rebind ( x ) {
		x.rebind( oldKeypath, newKeypath );
	}
}
