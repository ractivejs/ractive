utils.cancelKeypathResolution = function ( root, mustache ) {
	var index = root._pendingResolution.indexOf( mustache );

	if ( index !== -1 ) {
		root._pendingResolution.splice( index, 1 );
	}
};