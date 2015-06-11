import { isArray } from 'utils/is';
import { normalise } from 'shared/keypaths';
import runloop from 'global/runloop';
import getNewIndices from 'shared/getNewIndices';

var arrayProto = Array.prototype;

export default function ( methodName ) {
	return function ( keypath, ...args ) {
		const model = this.viewmodel.join( normalise( keypath ).split( '.' ) );
		const array = model.value;

		if ( !isArray( array ) ) {
			throw new Error( `shuffle array method ${method} called on non-array at ${keypath.getKeypath()}` );
		}

		const newIndices = getNewIndices( array.length, methodName, args );
		const result = arrayProto[ methodName ].apply( array, args );

		const promise = runloop.start( this, true ).then( () => result );

		if ( newIndices ) {
			model.shuffle( newIndices );
		} else {
			model.set( result );
		}

		runloop.end();

		return promise;
	};
}
