define([
	'config/types',
	'config/isClient',
	'render/shared/initMustache',
	'render/shared/updateMustache',
	'render/shared/resolveMustache',
	'render/shared/updateSection',
	'render/DomFragment/Section/reassignFragment',
	'render/DomFragment/Section/reassignFragments',
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
	reassignFragment,
	reassignFragments,
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

		smartUpdate: function ( methodName, args ) {
			var fragmentOptions;

			if ( methodName === 'push' || methodName === 'unshift' || methodName === 'splice' ) {
				fragmentOptions = {
					descriptor: this.descriptor.f,
					root:       this.root,
					pNode:      this.pNode,
					owner:      this
				};

				if ( this.descriptor.i ) {
					fragmentOptions.indexRef = this.descriptor.i;
				}
			}

			if ( this[ methodName ] ) { // if not, it's sort or reverse, which doesn't affect us (i.e. our length)
				this[ methodName ]( fragmentOptions, args );
			}
		},

		pop: function () {
			// teardown last fragment
			if ( this.length ) {
				this.fragments.pop().teardown( true );
				this.length -= 1;
			}
		},

		push: function ( fragmentOptions, args ) {
			var start, end, i;

			// append list item to context stack
			start = this.length;
			end = start + args.length;

			for ( i=start; i<end; i+=1 ) {
				fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
				fragmentOptions.index = i;

				this.fragments[i] = this.createFragment( fragmentOptions );
			}

			this.length += args.length;

			// append docfrag in front of next node
			this.pNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );
		},

		shift: function () {
			this.splice( null, [ 0, 1 ] );
		},

		unshift: function ( fragmentOptions, args ) {
			this.splice( fragmentOptions, [ 0, 0 ].concat( new Array( args.length ) ) );
		},

		splice: function ( fragmentOptions, args ) {
			var insertionPoint, addedItems, removedItems, balance, i, start, end, spliceArgs, reassignStart;

			if ( !args.length ) {
				return;
			}

			// figure out where the changes started...
			start = +( args[0] < 0 ? this.length + args[0] : args[0] );

			// ...and how many items were added to or removed from the array
			addedItems = Math.max( 0, args.length - 2 );
			removedItems = ( args[1] !== undefined ? args[1] : this.length - start );

			// It's possible to do e.g. [ 1, 2, 3 ].splice( 2, 2 ) - i.e. the second argument
			// means removing more items from the end of the array than there are. In these
			// cases we need to curb JavaScript's enthusiasm or we'll get out of sync
			removedItems = Math.min( removedItems, this.length - start );

			balance = addedItems - removedItems;

			if ( !balance ) {
				// The array length hasn't changed - we don't need to add or remove anything
				return;
			}

			// If more items were removed than added, we need to remove some things from the DOM
			if ( balance < 0 ) {
				end = start - balance;

				for ( i=start; i<end; i+=1 ) {
					this.fragments[i].teardown( true );
				}

				// Keep in sync
				this.fragments.splice( start, -balance );
			}

			// Otherwise we need to add some things to the DOM
			else {
				end = start + balance;

				// Figure out where these new nodes need to be inserted
				insertionPoint = ( this.fragments[ start ] ? this.fragments[ start ].firstNode() : this.parentFragment.findNextNode( this ) );

				// Make room for the new fragments. (Just trust me, this works...)
				spliceArgs = [ start, 0 ].concat( new Array( balance ) );
				this.fragments.splice.apply( this.fragments, spliceArgs );

				for ( i=start; i<end; i+=1 ) {
					fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
					fragmentOptions.index = i;

					this.fragments[i] = this.createFragment( fragmentOptions );
				}

				// Append docfrag in front of insertion point
				this.pNode.insertBefore( this.docFrag, insertionPoint );
			}

			this.length += balance;


			// Now we need to reassign existing fragments (e.g. items.4 -> items.3 - the keypaths,
			// context stacks and index refs will have changed)
			reassignStart = ( start + addedItems );

			reassignFragments( this.root, this, reassignStart, this.length, balance );
		},

		merge: merge,

		detach: function () {
			var i, len;

			len = this.fragments.length;
			for ( i = 0; i < len; i += 1 ) {
				this.docFrag.appendChild( this.fragments[i].detach() );
			}

			return this.docFrag;
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
			var id;

			while ( this.fragments.length ) {
				this.fragments.shift().teardown( destroy );
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

				if ( nextNode && ( nextNode.parentNode === this.pNode ) ) {
					this.pNode.insertBefore( this.docFrag, nextNode );
				}

				// ...but in some edge cases the next node will not have been attached to
				// the DOM yet, in which case we append to the end of the parent node
				else {
					// TODO could there be a situation in which later nodes could have
					// been attached to the parent node, i.e. we need to find a sibling
					// to insert before?
					this.pNode.appendChild( this.docFrag );
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

		findAll: function ( selector, queryResult ) {
			var i, len;

			len = this.fragments.length;
			for ( i = 0; i < len; i += 1 ) {
				this.fragments[i].findAll( selector, queryResult );
			}
		}
	};

	return DomSection;

});