define([
	'config/isClient',
	'utils/createElement'
], function (
	isClient,
	createElement
) {

	'use strict';

	var div, methodNames, unprefixed, prefixed, vendors, i, j, makeFunction;

	if ( !isClient ) {
		return;
	}

	div = createElement( 'div' );

	methodNames = [ 'matches', 'matchesSelector' ];
	vendors = [ 'o', 'ms', 'moz', 'webkit' ];

	makeFunction = function ( methodName ) {
		return function ( node, selector ) {
			return node[ methodName ]( selector );
		};
	};

	i = methodNames.length;
	while ( i-- ) {
		unprefixed = methodNames[i];

		if ( div[ unprefixed ] ) {
			return makeFunction( unprefixed );
		}

		j = vendors.length;
		while ( j-- ) {
			prefixed = vendors[i] + unprefixed.substr( 0, 1 ).toUpperCase() + unprefixed.substring( 1 );

			if ( div[ prefixed ] ) {
				return makeFunction( prefixed );
			}
		}
	}

	// IE8...
	return function ( node, selector ) {
		var nodes, i;

		nodes = ( node.parentNode || node.document ).querySelectorAll( selector );

		i = nodes.length;
		while ( i-- ) {
			if ( nodes[i] === node ) {
				return true;
			}
		}

		return false;
	};

});