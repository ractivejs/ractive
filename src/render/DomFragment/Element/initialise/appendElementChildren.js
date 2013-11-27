define([
	'config/namespaces',
	'render/StringFragment/_StringFragment',
	'circular'
], function (
	namespaces,
	StringFragment,
	circular
) {
	
	'use strict';

	var DomFragment;

	circular.push( function () {
		DomFragment = circular.DomFragment;
	});


	return function ( element, node, descriptor, docFrag ) {
		var liveQueries, i, selector, queryAllResult, j;

		if ( typeof descriptor.f === 'string' && ( !node || ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) ) {
			// great! we can use innerHTML
			element.html = descriptor.f;

			if ( docFrag ) {
				node.innerHTML = element.html;
				
				// Update live queries, if applicable
				liveQueries = element.root._liveQueries;
				i = liveQueries.length;
				while ( i-- ) {
					selector = liveQueries[i];

					if ( queryAllResult = node.querySelectorAll( selector ) && ( j = queryAllResult.length ) ) {
						( element.liveQueries || ( element.liveQueries = [] ) ).push( selector );
						element.liveQueries[ selector ] = [];

						while ( j-- ) {
							element.liveQueries[ selector ][j] = queryAllResult[j];
						}
					}
				}
			}
		}

		else {
			// once again, everyone has to suffer because of IE bloody 8
			if ( descriptor.e === 'style' && node.styleSheet !== undefined ) {
				element.fragment = new StringFragment({
					descriptor:   descriptor.f,
					root:         element.root,
					contextStack: element.parentFragment.contextStack,
					owner:        element
				});

				if ( docFrag ) {
					element.bubble = function () {
						node.styleSheet.cssText = element.fragment.toString();
					};
				}
			}

			else {
				element.fragment = new DomFragment({
					descriptor:   descriptor.f,
					root:         element.root,
					pNode:        node,
					contextStack: element.parentFragment.contextStack,
					owner:        element
				});

				if ( docFrag ) {
					node.appendChild( element.fragment.docFrag );
				}
			}
		}
	};

});