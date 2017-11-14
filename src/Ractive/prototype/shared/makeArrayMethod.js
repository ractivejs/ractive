import { splitKeypath } from 'shared/keypaths';
import runloop from 'src/global/runloop';
import getNewIndices from 'shared/getNewIndices';
import { isArray } from 'utils/is';

const arrayProto = Array.prototype;

export default function ( methodName ) {
	function path ( keypath, ...args ) {
		return model( this.viewmodel.joinAll( splitKeypath( keypath ) ), args );
	}

	function model ( mdl, args ) {
		let array = mdl.get();

		if ( !isArray( array ) ) {
			if ( array === undefined ) {
				array = [];
				const result = arrayProto[ methodName ].apply( array, args );
				const promise = runloop.start().then( () => result );
				mdl.set( array );
				runloop.end();
				return promise;
			} else {
				throw new Error( `shuffle array method ${methodName} called on non-array at ${mdl.getKeypath()}` );
			}
		}

		const newIndices = getNewIndices( array.length, methodName, args );
		const result = arrayProto[ methodName ].apply( array, args );

		const promise = runloop.start().then( () => result );
		promise.result = result;

		if ( newIndices ) {
			if ( mdl.shuffle ) {
				mdl.shuffle( newIndices );
			} else { // it's a computation, which don't have a shuffle, so just invalidate
				mdl.mark();
			}
		} else {
			mdl.set( result );
		}

		runloop.end();

		return promise;
	}

	return { path, model };
}
