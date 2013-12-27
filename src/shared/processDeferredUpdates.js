define([
	'shared/preDomUpdate',
	'shared/postDomUpdate'
], function (
	preDomUpdate,
	postDomUpdate
) {

	'use strict';

	return function ( ractive ) {
		preDomUpdate( ractive );
		postDomUpdate( ractive );
	};

});