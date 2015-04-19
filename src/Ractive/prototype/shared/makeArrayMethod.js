import { isArray } from 'utils/is';
import { normalise } from 'shared/keypaths';
import runloop from 'global/runloop';
import getNewIndices from 'shared/getNewIndices';

var arrayProto = Array.prototype;

export default function ( methodName ) {
	return function ( keypath, ...args ) {
		var array, newIndices = [], len, promise, result, context;

		context = this.viewmodel.getModel( keypath );

		result = context.shuffle( methodName, args );

		promise = runloop.start( this, true ).then( () => result );

		runloop.end();

		return promise;
	};
}
