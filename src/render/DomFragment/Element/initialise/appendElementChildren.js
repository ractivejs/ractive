define([
	'utils/warn',
	'config/namespaces',
	'render/StringFragment/_StringFragment',
	'circular'
], function (
	warn,
	namespaces,
	StringFragment,
	circular
) {
	
	'use strict';

	var DomFragment, updateCss, updateScript;

	circular.push( function () {
		DomFragment = circular.DomFragment;
	});


	updateCss = function () {
		this.node.styleSheet.cssText = this.fragment.toString();
	};

	updateScript = function () {
		if ( !this.node.type || this.node.type === 'text/javascript' ) {
			warn( 'Script tag was updated. This does not cause the code to be re-evaluated!' );
			// As it happens, we ARE in a position to re-evaluate the code if we wanted
			// to - we could eval() it, or insert it into a fresh (temporary) script tag.
			// But this would be a terrible idea with unpredictable results, so let's not.
		}

		this.node.innerHTML = this.fragment.toString();
	};


	return function ( element, node, descriptor, docFrag ) {
		var liveQueries, i, selector, queryAllResult, j;

		// Special case - script tags
		if ( element.lcName === 'script' ) {
			element.fragment = new StringFragment({
				descriptor:   descriptor.f,
				root:         element.root,
				contextStack: element.parentFragment.contextStack,
				owner:        element
			});

			if ( docFrag ) {
				element.node.innerHTML = element.fragment.toString();
				element.bubble = updateScript;
			}

			return;
		}

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
			if ( descriptor.e === 'style' && node && node.styleSheet !== undefined ) {
				element.fragment = new StringFragment({
					descriptor:   descriptor.f,
					root:         element.root,
					contextStack: element.parentFragment.contextStack,
					owner:        element
				});

				if ( docFrag ) {
					element.bubble = updateCss;
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