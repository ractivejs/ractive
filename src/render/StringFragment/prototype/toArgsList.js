define([
	'utils/warn',
	'utils/parseJSON'
], function (
	warn,
	parseJSON
) {

	'use strict';

	return function () {
		var values, counter, jsonesque, guid, errorMessage, parsed, processItems;

		if ( !this.argsList || this.dirty ) {
			values = {};
			counter = 0;

			guid = this.root._guid;

			processItems = function ( items ) {
				return items.map( function ( item ) {
					var placeholderId;

					if ( item.text ) {
						return item.text;
					}

					if ( item.fragments ) {
						return item.fragments.map( function ( fragment ) {
							return processItems( fragment.items );
						}).join( '' );
					}

					placeholderId = guid + '-' + counter++;
					values[ placeholderId ] = item.value;

					return '${' + placeholderId + '}';
				}).join( '' );
			};

			jsonesque = processItems( this.items );

			parsed = parseJSON( '[' + jsonesque + ']', values );

			if ( !parsed ) {
				errorMessage = 'Could not parse directive arguments (' + this.toString() + '). If you think this is a bug, please file an issue at http://github.com/RactiveJS/Ractive/issues';

				if ( this.root.debug ) {
					throw new Error( errorMessage );
				} else {
					warn( errorMessage );
					this.argsList = [ jsonesque ];
				}
			} else {
				this.argsList = parsed.value;
			}

			this.dirty = false;
		}

		return this.argsList;
	};

});