define([
	'config/types',
	'config/isClient',
	'render/shared/initMustache',
	'render/shared/updateMustache',
	'render/shared/resolveMustache',
	'render/shared/updateSection',
	'render/DomFragment/Section/helpers/splice',
	'render/DomFragment/Section/prototype/merge',
	'shared/teardown',
	'circular'
], function (
	types,
	isClient,
	initMustache,
	updateMustache,
	resolveMustache,
	updateSection,
	splice,
	merge,
	teardown,
	circular
) {

	'use strict';

	var DomSection, DomFragment;

	circular.push( function () {
		DomFragment = circular.DomFragment;
	});

	// Section
	DomSection = function ( options, docFrag ) {
		this.type = types.SECTION;
		this.inverted = !!options.descriptor.n;

		this.fragments = [];
		this.length = 0; // number of times this section is rendered

		if ( docFrag ) {
			this.docFrag = document.createDocumentFragment();
		}

		this.initialising = true;
		initMustache( this, options );

		if ( docFrag ) {
			docFrag.appendChild( this.docFrag );
		}

		this.initialising = false;
	};

	DomSection.prototype = {
		update: updateMustache,
		resolve: resolveMustache,

		smartUpdate: function ( methodName, spliceSummary ) {
			this.rendering = true;
			splice( this, spliceSummary );
			this.rendering = false;
		},

		merge: merge,

		detach: function () {
			var i, len;

			if ( this.docFrag ) {
				len = this.fragments.length;
				for ( i = 0; i < len; i += 1 ) {
					this.docFrag.appendChild( this.fragments[i].detach() );
				}

				return this.docFrag;
			}
		},

		teardown: function ( destroy ) {
			this.teardownFragments( destroy );

			teardown( this );
		},

		firstNode: function () {
			if ( this.fragments[0] ) {
				return this.fragments[0].firstNode();
			}

			return this.parentFragment.findNextNode( this );
		},

		findNextNode: function ( fragment ) {
			if ( this.fragments[ fragment.index + 1 ] ) {
				return this.fragments[ fragment.index + 1 ].firstNode();
			}

			return this.parentFragment.findNextNode( this );
		},

		teardownFragments: function ( destroy ) {
			var id, fragment;

			while ( fragment = this.fragments.shift() ) {
				fragment.teardown( destroy );
			}

			if ( this.fragmentsById ) {
				for ( id in this.fragmentsById ) {
					if ( this.fragments[ id ] ) {
						this.fragmentsById[ id ].teardown( destroy );
						this.fragmentsById[ id ] = null;
					}
				}
			}
		},

		render: function ( value ) {
			var nextNode, wrapped;

			// with sections, we need to get the fake value if we have a wrapped object
			if ( wrapped = this.root._wrapped[ this.keypath ] ) {
				value = wrapped.get();
			}

			// prevent sections from rendering multiple times (happens if
			// evaluators evaluate while update is happening)
			if ( this.rendering ) {
				return;
			}

			this.rendering = true;
			updateSection( this, value );
			this.rendering = false;

			// if we have no new nodes to insert (i.e. the section length stayed the
			// same, or shrank), we don't need to go any further
			if ( this.docFrag && !this.docFrag.childNodes.length ) {
				return;
			}

			// if this isn't the initial render, we need to insert any new nodes in
			// the right place
			if ( !this.initialising && isClient ) {

				// Normally this is just a case of finding the next node, and inserting
				// items before it...
				nextNode = this.parentFragment.findNextNode( this );

				if ( nextNode && ( nextNode.parentNode === this.parentFragment.pNode ) ) {
					this.parentFragment.pNode.insertBefore( this.docFrag, nextNode );
				}

				// ...but in some edge cases the next node will not have been attached to
				// the DOM yet, in which case we append to the end of the parent node
				else {
					// TODO could there be a situation in which later nodes could have
					// been attached to the parent node, i.e. we need to find a sibling
					// to insert before?
					this.parentFragment.pNode.appendChild( this.docFrag );
				}
			}
		},

		createFragment: function ( options ) {
			var fragment = new DomFragment( options );

			if ( this.docFrag ) {
				this.docFrag.appendChild( fragment.docFrag );
			}

			return fragment;
		},

		toString: function () {
			var str, i, id, len;

			str = '';

			i = 0;
			len = this.length;

			for ( i=0; i<len; i+=1 ) {
				str += this.fragments[i].toString();
			}

			if ( this.fragmentsById ) {
				for ( id in this.fragmentsById ) {
					if ( this.fragmentsById[ id ] ) {
						str += this.fragmentsById[ id ].toString();
					}
				}
			}

			return str;
		},

		find: function ( selector ) {
			var i, len, queryResult;

			len = this.fragments.length;
			for ( i = 0; i < len; i += 1 ) {
				if ( queryResult = this.fragments[i].find( selector ) ) {
					return queryResult;
				}
			}

			return null;
		},

		findAll: function ( selector, query ) {
			var i, len;

			len = this.fragments.length;
			for ( i = 0; i < len; i += 1 ) {
				this.fragments[i].findAll( selector, query );
			}
		},

		findComponent: function ( selector ) {
			var i, len, queryResult;

			len = this.fragments.length;
			for ( i = 0; i < len; i += 1 ) {
				if ( queryResult = this.fragments[i].findComponent( selector ) ) {
					return queryResult;
				}
			}

			return null;
		},

		findAllComponents: function ( selector, query ) {
			var i, len;

			len = this.fragments.length;
			for ( i = 0; i < len; i += 1 ) {
				this.fragments[i].findAllComponents( selector, query );
			}
		}
	};

	return DomSection;

});
