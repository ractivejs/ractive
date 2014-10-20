export default function Viewmodel$registerSpecial ( keypath, index, dependant ) {
	if ( let mapping = this.mappings[ keypath.split( '.' )[0] ] ) {
		return mapping.origin.registerSpecial( mapping.resolve( keypath ), index, dependant );
	}

	specials = ( this.specials[ keypath ] || ( this.specials[ keypath ] = [] ) );
	( specials[ index ] || ( specials[ index ] = [] ) ).push( dependant );
}
