define([
	'config/vendors'
], function (
	vendors
) {

	'use strict';

	var unprefixPattern = new RegExp( '^-(?:' + vendors.join( '|' ) + ')-' );

	return function ( prop ) {
		return prop.replace( unprefixPattern, '' );
	};

});