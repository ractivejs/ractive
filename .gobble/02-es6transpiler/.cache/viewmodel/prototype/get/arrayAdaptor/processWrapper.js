define(function () {

	'use strict';
	
	return function ( wrapper, array, methodName, spliceSummary ) {
		var root = wrapper.root, keypath = wrapper.keypath;
	
		// If this is a sort or reverse, we just do root.set()...
		// TODO use merge logic?
		if ( methodName === 'sort' || methodName === 'reverse' ) {
			root.viewmodel.set( keypath, array );
			return;
		}
	
		if ( !spliceSummary ) {
			// (presumably we tried to pop from an array of zero length.
			// in which case there's nothing to do)
			return;
		}
	
		root.viewmodel.splice( keypath, spliceSummary );
	};

});