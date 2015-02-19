import { fatal } from 'utils/log';

export default function Viewmodel$addComputed ( computations ) {
	var key, keypath, initialValue;

	for ( key in computations ) {
		if ( key in this.mappings ) {
			fatal( 'Cannot map to a computed property (\'%s\')', key );
		}

		keypath = this.getKeypath( key );
		// maybe this should go through viewmodel. depends how things shake out
		initialValue = keypath.get();
		keypath.clearCachedValue();

		this.compute( keypath, computations[ key ], initialValue );
	}
}
