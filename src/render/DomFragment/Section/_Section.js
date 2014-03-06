define([
	'config/types',
	'render/shared/initMustache',
	'render/shared/updateMustache',
	'render/shared/resolveMustache',
	'render/DomFragment/Section/prototype/merge',
	'render/DomFragment/Section/prototype/render',
	'render/DomFragment/Section/prototype/splice',
	'shared/teardown',
	'circular'
], function (
	types,
	initMustache,
	updateMustache,
	resolveMustache,
	merge,
	render,
	splice,
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
		splice: splice,
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
			var fragment;

			while ( fragment = this.fragments.shift() ) {
				fragment.teardown( destroy );
			}
		},

		render: render,

		createFragment: function ( options ) {
			var fragment = new DomFragment( options );

			if ( this.docFrag ) {
				this.docFrag.appendChild( fragment.docFrag );
			}

			return fragment;
		},

		toString: function () {
			var str, i, len;

			str = '';

			i = 0;
			len = this.length;

			for ( i=0; i<len; i+=1 ) {
				str += this.fragments[i].toString();
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
