define([
	'utils/warn',
	'utils/defineProperty'
], function (
	warn,
	defineProperty
) {

	'use strict';

	var sortQuery, comparePosition;

	sortQuery = function () {
		this.sort( comparePosition );
		this._dirty = false;
	};

	// TODO IE8 support...
	comparePosition = function ( node, otherNode ) {
		var bitmask = node.compareDocumentPosition( otherNode );
		return ( bitmask & 2 ) ? 1 : -1;
	};

	return function ( selector, options ) {
		var liveQueries, queryResult;

		if ( !this.el ) {
			return [];
		}

		options = options || {};
		liveQueries = this._liveQueries;

		if ( queryResult = liveQueries[ selector ] ) {
			return ( options && options.live ) ? queryResult : queryResult.slice();
		}

		queryResult = [];

		if ( options.live ) {
			liveQueries.push( selector );
			liveQueries[ selector ] = queryResult;

			defineProperty( queryResult, 'cancel', {
				value: function () {
					var index = liveQueries.indexOf( selector );

					if ( index !== -1 ) {
						liveQueries.splice( index, 1 );
						liveQueries[ selector ] = null;
					}
				}
			});

			defineProperty( queryResult, '_sort', { value: sortQuery });
			defineProperty( queryResult, '_dirty', { value: false, writable: true });
		}

		this.fragment.findAll( selector, options, queryResult );
		return queryResult;
	};

});