import { isArray } from '../../../utils/is';
import { splitKeypath } from '../../../shared/keypaths';
import runloop from '../../../global/runloop';
import getNewIndices from '../../../shared/getNewIndices';

const arrayProto = Array.prototype;

export default function ( methodName ) {
	return function ( keypath, ...args ) {
		const model = this.viewmodel.joinAll( splitKeypath( keypath ) );

		if ( model.isReadonly ) throw new Error( `shuffle array method ${methodName} called on readonly data at ${model.getKeypath()}` );

		let array = model.get();

		if ( !isArray( array ) ) {
			if ( array === undefined ) {
				array = [];
				const result = arrayProto[ methodName ].apply( array, args );
				return this.set( keypath, array ).then( () => result );
			} else {
				throw new Error( `shuffle array method ${methodName} called on non-array at ${model.getKeypath()}` );
			}
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
