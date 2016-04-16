import { isArray } from '../../../utils/is';
import { splitKeypath } from '../../../shared/keypaths';
import runloop from '../../../global/runloop';
import getNewIndices from '../../../shared/getNewIndices';

const arrayProto = Array.prototype;

export default function ( methodName ) {
	return function ( keypath, ...args ) {
		const model = this.viewmodel.joinAll( splitKeypath( keypath ) );
		const array = model.get();

		if ( !isArray( array ) ) {
			throw new Error( `shuffle array method ${methodName} called on non-array at ${model.getKeypath()}` );
		}

		const newIndices = getNewIndices( array.length, methodName, args );
		const result = arrayProto[ methodName ].apply( array, args );

		const promise = runloop.start( this, true ).then( () => result );
		promise.result = result;

		if ( newIndices ) {
			model.shuffle( newIndices );
		} else {
			model.set( result );
		}

		runloop.end();

		return promise;
	};
}
