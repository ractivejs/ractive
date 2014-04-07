define([
	'config/types',
	'utils/matches',
	'render/shared/reassignFragment',
	'render/shared/initFragment',
	'render/DomFragment/shared/insertHtml',
	'render/DomFragment/Text',
	'render/DomFragment/Interpolator',
	'render/DomFragment/Section/_Section',
	'render/DomFragment/Triple',
	'render/DomFragment/Element/_Element',
	'render/DomFragment/Partial/_Partial',
	'render/DomFragment/Component/_Component',
	'render/DomFragment/Comment',
	'circular'
], function (
	types,
	matches,
	reassignFragment,
	initFragment,
	insertHtml,
	Text,
	Interpolator,
	Section,
	Triple,
	Element,
	Partial,
	Component,
	Comment,
	circular
) {

	'use strict';

	var DomFragment = function ( options ) {
		if ( options.pNode ) {
			this.docFrag = document.createDocumentFragment();
		}

		// if we have an HTML string, our job is easy.
		if ( typeof options.descriptor === 'string' ) {
			this.html = options.descriptor;

			if ( this.docFrag ) {
				this.nodes = insertHtml( this.html, options.pNode.tagName, options.pNode.namespaceURI, this.docFrag );
			}
		}

		else {
			// otherwise we need to make a proper fragment
			initFragment( this, options );
		}
	};

	DomFragment.prototype = {
		reassign: reassignFragment,

		detach: function () {
			var len, i;

			if ( this.docFrag ) {
				// if this was built from HTML, we just need to remove the nodes
				if ( this.nodes ) {
					len = this.nodes.length;
					for ( i = 0; i < len; i += 1 ) {
						this.docFrag.appendChild( this.nodes[i] );
					}
				}

				// otherwise we need to detach each item
				else if ( this.items ) {
					len = this.items.length;
					for ( i = 0; i < len; i += 1 ) {
						this.docFrag.appendChild( this.items[i].detach() );
					}
				}

				return this.docFrag;
			}
		},

		createItem: function ( options ) {
			if ( typeof options.descriptor === 'string' ) {
				return new Text( options, this.docFrag );
			}

			switch ( options.descriptor.t ) {
				case types.INTERPOLATOR: return new Interpolator( options, this.docFrag );
				case types.SECTION:      return new Section( options, this.docFrag );
				case types.TRIPLE:       return new Triple( options, this.docFrag );
				case types.ELEMENT:
					if ( this.root.components[ options.descriptor.e ] ) {
						return new Component( options, this.docFrag );
					}
					return new Element( options, this.docFrag );
				case types.PARTIAL:      return new Partial( options, this.docFrag );
				case types.COMMENT:      return new Comment( options, this.docFrag );

				default: throw new Error( 'Something very strange happened. Please file an issue at https://github.com/RactiveJS/Ractive/issues. Thanks!' );
			}
		},

		teardown: function ( destroy ) {
			var node;

			// if this was built from HTML, we just need to remove the nodes
			if ( this.nodes && destroy ) {
				while ( node = this.nodes.pop() ) {
					node.parentNode.removeChild( node );
				}
			}

			// otherwise we need to detach each item
			else if ( this.items ) {
				while ( this.items.length ) {
					this.items.pop().teardown( destroy );
				}
			}

			this.nodes = this.items = this.docFrag = null;
		},

		firstNode: function () {
			if ( this.items && this.items[0] ) {
				return this.items[0].firstNode();
			} else if ( this.nodes ) {
				return this.nodes[0] || null;
			}

			return null;
		},

		findNextNode: function ( item ) {
			var index = item.index;

			if ( this.items[ index + 1 ] ) {
				return this.items[ index + 1 ].firstNode();
			}

			// if this is the root fragment, and there are no more items,
			// it means we're at the end...
			if ( this.owner === this.root ) {
				if ( !this.owner.component ) {
					return null;
				}

				// ...unless this is a component
				return this.owner.component.findNextNode();
			}

			return this.owner.findNextNode( this );
		},

		toString: function () {
			var html, i, len, item;

			if ( this.html ) {
				return this.html;
			}

			html = '';

			if ( !this.items ) {
				return html;
			}

			len = this.items.length;

			for ( i=0; i<len; i+=1 ) {
				item = this.items[i];
				html += item.toString();
			}

			return html;
		},

		find: function ( selector ) {
			var i, len, item, node, queryResult;

			if ( this.nodes ) {
				len = this.nodes.length;
				for ( i = 0; i < len; i += 1 ) {
					node = this.nodes[i];

					// we only care about elements
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
			}

			if ( this.items ) {
				len = this.items.length;
				for ( i = 0; i < len; i += 1 ) {
					item = this.items[i];

					if ( item.find && ( queryResult = item.find( selector ) ) ) {
						return queryResult;
					}
				}

				return null;
			}
		},

		findAll: function ( selector, query ) {
			var i, len, item, node, queryAllResult, numNodes, j;

			if ( this.nodes ) {
				len = this.nodes.length;
				for ( i = 0; i < len; i += 1 ) {
					node = this.nodes[i];

					// we only care about elements
					if ( node.nodeType !== 1 ) {
						continue;
					}

					if ( matches( node, selector ) ) {
						query.push( node );
					}

					if ( queryAllResult = node.querySelectorAll( selector ) ) {
						numNodes = queryAllResult.length;
						for ( j = 0; j < numNodes; j += 1 ) {
							query.push( queryAllResult[j] );
						}
					}
				}
			}

			else if ( this.items ) {
				len = this.items.length;
				for ( i = 0; i < len; i += 1 ) {
					item = this.items[i];

					if ( item.findAll ) {
						item.findAll( selector, query );
					}
				}
			}

			return query;
		},

		findComponent: function ( selector ) {
			var len, i, item, queryResult;

			if ( this.items ) {
				len = this.items.length;
				for ( i = 0; i < len; i += 1 ) {
					item = this.items[i];

					if ( item.findComponent && ( queryResult = item.findComponent( selector ) ) ) {
						return queryResult;
					}
				}

				return null;
			}
		},

		findAllComponents: function ( selector, query ) {
			var i, len, item;

			if ( this.items ) {
				len = this.items.length;
				for ( i = 0; i < len; i += 1 ) {
					item = this.items[i];

					if ( item.findAllComponents ) {
						item.findAllComponents( selector, query );
					}
				}
			}

			return query;
		}
	};

	circular.DomFragment = DomFragment;
	return DomFragment;

});
