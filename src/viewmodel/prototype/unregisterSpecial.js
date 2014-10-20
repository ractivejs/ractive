import removeFromArray from 'utils/removeFromArray';

export default function Viewmodel$unregisterSpecial ( keypath, index, dependant ) {
	// TODO handle bindings
	removeFromArray( this.specials[ keypath ][ index ], dependant );
}