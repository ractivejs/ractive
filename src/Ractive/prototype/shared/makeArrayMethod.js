import { isArray } from 'utils/is';
import { normalise } from 'shared/keypaths';
import runloop from 'global/runloop';
import getNewIndices from 'shared/getNewIndices';

var arrayProto = Array.prototype;

export default function ( methodName ) {
	return function ( keypath, ...args ) {
		var array, newIndices = [], len, promise, result, model;

		model = this.viewmodel.getModel( keypath );
		array = this.viewmodel.get( model );
		len = array.length;

		if ( !isArray( array ) ) {
			throw new Error( 'Called ractive.' + methodName + '(\'' + keypath + '\'), but \'' + keypath + '\' does not refer to an array' );
		}

		newIndices = getNewIndices( array, methodName, args );

		result = arrayProto[ methodName ].apply( array, args );
		promise = runloop.start( this, true ).then( () => result );

		if ( !!newIndices ) {
			this.viewmodel.smartUpdate( model, array, newIndices );
		} else {
			model.mark();
		}

		runloop.end();

		return promise;
	};
}
