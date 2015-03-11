import { fatal } from 'utils/log';

export default function Viewmodel$addComputed ( computations ) {
	var key, keypath, initialValue;

	for ( key in computations ) {

		keypath = this.getModel( key );

		if ( keypath.owner !== this ) {
			fatal( 'Computed property \'%s\' cannot shadow a mapped property', key );
		}

		initialValue = keypath.get();
		// keypath.clearCachedValue();

		this.compute( keypath, computations[ key ], initialValue );
	}
}
