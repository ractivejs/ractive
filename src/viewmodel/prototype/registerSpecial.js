export default function Viewmodel$registerSpecial ( keypath, index, dependant ) {
	var mapping, specials;

	if ( mapping = this.mappings[ keypath.split( '.' )[0] ] ) {
		return mapping.origin.registerSpecial( mapping.map( keypath ), index, dependant );
	}

	specials = ( this.specials[ keypath ] || ( this.specials[ keypath ] = [] ) );
	( specials[ index ] || ( specials[ index ] = [] ) ).push( dependant );
}
