import isArray from 'utils/isArray';
import runloop from 'global/runloop';
import getSpliceEquivalent from 'shared/getSpliceEquivalent';
import summariseSpliceOperation from 'shared/summariseSpliceOperation';

var arrayProto = Array.prototype;

export default function ( methodName ) {
	return function ( keypath, ...args ) {
		var array, spliceEquivalent, newIndices = [], len, promise, result;

		array = this.get( keypath );
		len = array.length;

		if ( !isArray( array ) ) {
			throw new Error( 'Called ractive.' + methodName + '(\'' + keypath + '\'), but \'' + keypath + '\' does not refer to an array' );
		}

		result = arrayProto[ methodName ].apply( array, args );
		promise = runloop.start( this, true ).then( () => result );

		if ( spliceEquivalent = getSpliceEquivalent( array, methodName, args ) ) {
			newIndices = summariseSpliceOperation( len, spliceEquivalent[0] );
			this.viewmodel.smartUpdate( keypath, array, newIndices );
		} else {
			this.viewmodel.mark( keypath );
		}

		runloop.end();

		return promise;
	};
}
