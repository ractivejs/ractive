define(['utils/detachNode'],function (detachNode) {

	'use strict';
	
	return function () {
		return detachNode( this.node );
	};

});