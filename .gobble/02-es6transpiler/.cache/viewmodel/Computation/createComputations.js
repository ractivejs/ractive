define(['viewmodel/Computation/getComputationSignature','viewmodel/Computation/Computation'],function (getComputationSignature, Computation) {

	'use strict';
	
	return function createComputations ( ractive, computed ) {
		var key, signature;
	
		for ( key in computed ) {
			signature = getComputationSignature( computed[ key ] );
			ractive.viewmodel.computations[ key ] = new Computation( ractive, key, signature );
		}
	};

});