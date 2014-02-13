define([
	'utils/warn',
	'config/namespaces',
	'render/StringFragment/_StringFragment',
	'render/DomFragment/Element/shared/getMatchingStaticNodes',
	'circular'
], function (
	warn,
	namespaces,
	StringFragment,
	getMatchingStaticNodes,
	circular
) {

	'use strict';

	var DomFragment, updateCss, updateScript;

	circular.push( function () {
		DomFragment = circular.DomFragment;
	});


	updateCss = function () {
		var node = this.node, content = this.fragment.toString();

		if ( node.styleSheet ) {
			node.styleSheet.cssText = content;
		} else {
			node.innerHTML = content;
		}

	};

	updateScript = function () {
		if ( !this.node.type || this.node.type === 'text/javascript' ) {
			warn( 'Script tag was updated. This does not cause the code to be re-evaluated!' );
			// As it happens, we ARE in a position to re-evaluate the code if we wanted
			// to - we could eval() it, or insert it into a fresh (temporary) script tag.
			// But this would be a terrible idea with unpredictable results, so let's not.
		}

		this.node.text = this.fragment.toString();
	};


	return function appendElementChildren ( element, node, descriptor, docFrag ) {
		// Special case - script and style tags
		if ( element.lcName === 'script' || element.lcName === 'style' ) {
			element.fragment = new StringFragment({
				descriptor:   descriptor.f,
				root:         element.root,
				owner:        element
			});

			if ( docFrag ) {
				if ( element.lcName === 'script' ) {
					element.bubble = updateScript;
					element.node.text = element.fragment.toString(); // bypass warning initially
				} else {
					element.bubble = updateCss;
					element.bubble();
				}
			}

			return;
		}

		if ( typeof descriptor.f === 'string' && ( !node || ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) ) {
			// great! we can use innerHTML
			element.html = descriptor.f;

			if ( docFrag ) {
				node.innerHTML = element.html;

				// Update live queries, if applicable
				element.matchingStaticNodes = {}; // so we can remove matches made with querySelectorAll at teardown time
				updateLiveQueries( element );
			}
		}

		else {
			element.fragment = new DomFragment({
				descriptor:   descriptor.f,
				root:         element.root,
				pNode:        node,
				owner:        element
			});

			if ( docFrag ) {
				node.appendChild( element.fragment.docFrag );
			}
		}
	};

	function updateLiveQueries ( element ) {
		var instance, liveQueries, node, selector, query, matchingStaticNodes, i;

		node = element.node;
		instance = element.root;

		do {
			liveQueries = instance._liveQueries;

			i = liveQueries.length;
			while ( i-- ) {
				selector = liveQueries[i];
				query = liveQueries[ selector ];

				matchingStaticNodes = getMatchingStaticNodes( element, selector );
				query.push.apply( query, matchingStaticNodes );
			}
		} while ( instance = instance._parent );
	}

});
