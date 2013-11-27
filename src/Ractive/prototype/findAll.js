define([
	'utils/warn',
	'utils/matches',
	'utils/defineProperties'
], function (
	warn,
	matches,
	defineProperties
) {

	'use strict';

	var makeQuery, cancelQuery, sortQuery, dirtyQuery, testNode, removeNode, comparePosition;

	makeQuery = function ( ractive, selector, live ) {
		var query;

		query = [];

		defineProperties( query, {
			selector: { value: selector },
			live: { value: live },

			_test: { value: testNode }
		});

		if ( !live ) {
			return query;
		}

		defineProperties( query, {
			cancel: { value: cancelQuery },
			
			_root: { value: ractive },
			_sort: { value: sortQuery },
			_dirty: { value: false, writable: true },
			_makeDirty: { value: dirtyQuery },
			_remove: { value: removeNode }
		});

		return query;
	};

	cancelQuery = function () {
		var liveQueries, selector, index;

		liveQueries = this._root.liveQueries;
		selector = this.selector;

		index = liveQueries.indexOf( selector );

		if ( index !== -1 ) {
			liveQueries.splice( index, 1 );
			liveQueries[ selector ] = null;
		}
	};

	dirtyQuery = function () {
		if ( !this._dirty ) {
			this._root._defLiveQueries.push( this );
			this._dirty = true;
		}
	};

	sortQuery = function () {
		this.sort( comparePosition );
		this._dirty = false;
	};

	// TODO IE8 support...
	comparePosition = function ( node, otherNode ) {
		var bitmask = node.compareDocumentPosition( otherNode );
		return ( bitmask & 2 ) ? 1 : -1;
	};

	testNode = function ( node, noDirty ) {
		if ( matches( node, this.selector ) ) {
			this.push( node );
			
			if ( !noDirty ) {
				this._makeDirty();
			}

			return true;
		}
	};

	removeNode = function ( node ) {
		var index = this.indexOf( node );

		if ( index !== -1 ) {
			this.splice( index, 1 );
		}
	};

	return function ( selector, options ) {
		var liveQueries, query;

		if ( !this.el ) {
			return [];
		}

		options = options || {};
		liveQueries = this._liveQueries;

		// Shortcut: if we're maintaining a live query with this
		// selector, we don't need to traverse the parallel DOM
		if ( query = liveQueries[ selector ] ) {

			// Either return the exact same query, or (if not live) a snapshot
			return ( options && options.live ) ? query : query.slice();
		}

		query = makeQuery( this, selector, !!options.live );

		// Add this to the list of live queries Ractive needs to maintain,
		// if applicable
		if ( query.live ) {
			this._liveQueries.push( selector );
			this._liveQueries[ selector ] = query;
		}

		this.fragment.findAll( selector, query );
		return query;
	};

});