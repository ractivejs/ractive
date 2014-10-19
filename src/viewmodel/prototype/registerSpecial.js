export default function Viewmodel$registerSpecial ( keypath, index, dependant ) {
	var specials;

	// TODO handle bindings

	specials = ( this.specials[ keypath ] || ( this.specials[ keypath ] = [] ) );
	( specials[ index ] || ( specials[ index ] = [] ) ).push( dependant );
}