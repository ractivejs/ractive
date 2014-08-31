define(['config/isClient','config/vendors','utils/createElement'],function (isClient, vendors, createElement) {

	'use strict';
	
	var matches, div, methodNames, unprefixed, prefixed, i, j, makeFunction;
	
	if ( !isClient ) {
		matches = null;
	} else {
		div = createElement( 'div' );
		methodNames = [ 'matches', 'matchesSelector' ];
	
		makeFunction = function ( methodName ) {
			return function ( node, selector ) {
				return node[ methodName ]( selector );
			};
		};
	
		i = methodNames.length;
	
		while ( i-- && !matches ) {
			unprefixed = methodNames[i];
	
			if ( div[ unprefixed ] ) {
				matches = makeFunction( unprefixed );
			} else {
				j = vendors.length;
				while ( j-- ) {
					prefixed = vendors[i] + unprefixed.substr( 0, 1 ).toUpperCase() + unprefixed.substring( 1 );
	
					if ( div[ prefixed ] ) {
						matches = makeFunction( prefixed );
						break;
					}
				}
			}
		}
	
		// IE8...
		if ( !matches ) {
			matches = function ( node, selector ) {
				var nodes, parentNode, i;
	
				parentNode = node.parentNode;
	
				if ( !parentNode ) {
					// empty dummy <div>
					div.innerHTML = '';
	
					parentNode = div;
					node = node.cloneNode();
	
					div.appendChild( node );
				}
	
				nodes = parentNode.querySelectorAll( selector );
	
				i = nodes.length;
				while ( i-- ) {
					if ( nodes[i] === node ) {
						return true;
					}
				}
	
				return false;
			};
		}
	}
	
	return matches;

});