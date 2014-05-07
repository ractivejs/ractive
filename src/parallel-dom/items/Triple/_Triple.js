import types from 'config/types';
import matches from 'utils/matches';
import Mustache from 'parallel-dom/shared/Mustache/_Mustache';
import insertHtml from 'parallel-dom/items/Triple/helpers/insertHtml';
import teardown from 'shared/teardown';

var DomTriple = function ( options, docFrag ) {
	this.type = types.TRIPLE;

	this.initialising = true;
	Mustache.init( this, options );

	this.initialising = false;
};

DomTriple.prototype = {
	update: Mustache.update,
	resolve: Mustache.resolve,
	reassign: Mustache.reassign,

	detach: function () {
		var len, i;

		if ( this.docFrag ) {
			len = this.nodes.length;
			for ( i = 0; i < len; i += 1 ) {
				this.docFrag.appendChild( this.nodes[i] );
			}

			return this.docFrag;
		}
	},

	teardown: function ( destroy ) {
		if ( destroy ) {
			this.detach();
			this.docFrag = this.nodes = null;
		}

		teardown( this );
	},

	firstNode: function () {
		if ( this.nodes[0] ) {
			return this.nodes[0];
		}

		return this.parentFragment.findNextNode( this );
	},

	render: function () {
		var parentElement = this.pElement;

		this.docFrag = document.createDocumentFragment();
		this.nodes = insertHtml( this.value, parentElement.name, parentElement.namespace, this.docFrag );

		return this.docFrag;
	},

	setValue: function ( html ) {
		var node, parentElement, parentNode;

		if ( !this.nodes ) {
			// looks like we're in a server environment...
			// nothing to see here, move along
			return;
		}

		// remove existing nodes
		while ( this.nodes.length ) {
			node = this.nodes.pop();
			node.parentNode.removeChild( node );
		}

		if ( !html ) {
			this.nodes = [];
			return;
		}

		// get new nodes
		parentElement = this.pElement;

		this.nodes = insertHtml( html, parentElement.name, parentElement.namespace, this.docFrag );

		if ( !this.initialising ) {
			parentNode = this.pElement.node;
			parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );

			// Special case - we're inserting the contents of a <select>
			if ( parentNode.tagName === 'SELECT' && parentNode._ractive && parentNode._ractive.binding ) {
				parentNode._ractive.binding.update();
			}
		}
	},

	toString: function () {
		return ( this.value != undefined ? this.value : '' );
	},

	find: function ( selector ) {
		var i, len, node, queryResult;

		len = this.nodes.length;
		for ( i = 0; i < len; i += 1 ) {
			node = this.nodes[i];

			if ( node.nodeType !== 1 ) {
				continue;
			}

			if ( matches( node, selector ) ) {
				return node;
			}

			if ( queryResult = node.querySelector( selector ) ) {
				return queryResult;
			}
		}

		return null;
	},

	findAll: function ( selector, queryResult ) {
		var i, len, node, queryAllResult, numNodes, j;

		len = this.nodes.length;
		for ( i = 0; i < len; i += 1 ) {
			node = this.nodes[i];

			if ( node.nodeType !== 1 ) {
				continue;
			}

			if ( matches( node, selector ) ) {
				queryResult.push( node );
			}

			if ( queryAllResult = node.querySelectorAll( selector ) ) {
				numNodes = queryAllResult.length;
				for ( j = 0; j < numNodes; j += 1 ) {
					queryResult.push( queryAllResult[j] );
				}
			}
		}
	}
};

export default DomTriple;
