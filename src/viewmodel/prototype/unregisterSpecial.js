import removeFromArray from 'utils/removeFromArray';

export default function Viewmodel$unregisterSpecial ( keypath, index, dependant ) {
	if ( let mapping = this.mappings[ keypath.split( '.' )[0] ] ) {
		return mapping.origin.unregisterSpecial( mapping.resolve( keypath ), index, dependant );
	}

	removeFromArray( this.specials[ keypath ][ index ], dependant );
}
