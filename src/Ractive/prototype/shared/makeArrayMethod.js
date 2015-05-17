import { isArray } from 'utils/is';
import { normalise } from 'shared/keypaths';
import runloop from 'global/runloop';
import getNewIndices from 'shared/getNewIndices';

var arrayProto = Array.prototype;

export default function ( methodName ) {
	return function ( keypath, ...args ) {
		var array, newIndices = [], len, promise, result, context;

		promise = runloop.start( this, true ).then( () => result );

		context = this.viewmodel.getContext( keypath );
		result = context.shuffle( methodName, args );

		runloop.end();

		return promise;
	};
}
