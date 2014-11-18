export default function Component$rebind ( oldKeypath, newKeypath ) {
	var query;

	this.resolvers.forEach( rebind );

	for ( let k in this.yielders ) {
		if ( this.yielders[k][0] ) {
			rebind( this.yielders[k][0] );
		}
	}

	if ( query = this.root._liveComponentQueries[ '_' + this.name ] ) {
		query._makeDirty();
	}

	function rebind ( x ) {
		x.rebind( oldKeypath, newKeypath );
	}
}
