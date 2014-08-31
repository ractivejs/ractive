define(['utils/isArray','global/runloop','shared/getSpliceEquivalent','shared/summariseSpliceOperation'],function (isArray, runloop, getSpliceEquivalent, summariseSpliceOperation) {

	'use strict';
	
	var arrayProto = Array.prototype;
	
	return function ( methodName ) {
		return function ( keypath, ...args ) {
			var array, spliceEquivalent, spliceSummary, promise, change;
	
			array = this.get( keypath );
	
			if ( !isArray( array ) ) {
				throw new Error( 'Called ractive.' + methodName + '(\'' + keypath + '\'), but \'' + keypath + '\' does not refer to an array' );
			}
	
			spliceEquivalent = getSpliceEquivalent( array, methodName, args );
			spliceSummary = summariseSpliceOperation( array, spliceEquivalent );
	
			if ( spliceSummary ) {
				change = arrayProto.splice.apply( array, spliceEquivalent );
			} else {
				change = arrayProto[ methodName ].apply( array, args );
			}
	
			promise = runloop.start( this, true );
			if ( spliceSummary ) {
				this.viewmodel.splice( keypath, spliceSummary );
			} else {
				this.viewmodel.mark( keypath );
			}
			runloop.end();
	
			// resolve the promise with removals if applicable
			if ( methodName === 'splice' || methodName === 'pop' || methodName === 'shift' ) {
				promise = promise.then( function() {
					return change;
				} );
			}
	
			return promise;
		};
	};

});