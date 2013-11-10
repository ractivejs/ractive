define([
	'config/namespaces',
	'render/StringFragment/_StringFragment'
], function (
	namespaces,
	StringFragment
) {
	
	'use strict';

	var DomFragment;


	loadCircularDependency( function () {
		require([ 'render/DomFragment/_DomFragment' ], function ( dep ) {
			DomFragment = dep;
		});
	});


	return function ( element, node, descriptor, docFrag ) {
		if ( typeof descriptor.f === 'string' && ( !node || ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) ) {
			// great! we can use innerHTML
			element.html = descriptor.f;

			if ( docFrag ) {
				node.innerHTML = element.html;
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
					parentNode:   node,
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