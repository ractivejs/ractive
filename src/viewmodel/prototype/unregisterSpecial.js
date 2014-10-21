import removeFromArray from 'utils/removeFromArray';

export default function Viewmodel$unregisterSpecial ( keypath, index, dependant ) {
	var mapping;

	if ( mapping = this.mappings[ keypath.split( '.' )[0] ] ) {
		return mapping.origin.unregisterSpecial( mapping.map( keypath ), index, dependant );
	}

	removeFromArray( this.specials[ keypath ][ index ], dependant );
}
