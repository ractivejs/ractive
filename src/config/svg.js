define( function () {

	'use strict';

	if ( typeof document === 'undefined' ) {
		return;
	}

	return document && document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' );

});