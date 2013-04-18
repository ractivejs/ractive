var _private;

(function () {

	'use strict';

	var formattersCache = {};

	_private = {
		// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
		isArray: function ( obj ) {
			return Object.prototype.toString.call( obj ) === '[object Array]';
		},

		// TODO what about non-POJOs?
		isObject: function ( obj ) {
			return ( Object.prototype.toString.call( obj ) === '[object Object]' ) && ( typeof obj !== 'function' );
		},

		// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
		isNumeric: function ( n ) {
			return !isNaN( parseFloat( n ) ) && isFinite( n );
		},

		// TODO this is a bit regex-heavy... could be optimised maybe?
		splitKeypath: function ( keypath ) {
			var result, hasEscapedDots, hasFormatters, formatters, split, i, replacer, index, startIndex, key, keys, remaining, blanked, part;

			// if this string contains no escaped dots or formatters,
			// we can just split on dots, after converting from array notation
			if ( !( hasEscapedDots = /\\\./.test( keypath ) ) && !( hasFormatters = /⭆.+⭅/.test( keypath ) ) ) {
				return keypath.replace( /\[\s*([0-9]+)\s*\]/g, '.$1' ).split( '.' );
			}

			keys = [];
			remaining = keypath;
			
			// first, blank formatters in case they contain dots, but store them
			// so we can reinstate them later
			if ( hasFormatters ) {
				formatters = [];
				remaining = remaining.replace( /⭆(.+)⭅/g, function ( match, $1 ) {
					var blanked, i;

					formatters[ formatters.length ] = $1;
					return '⭆x⭅';
				});
			}
			

			startIndex = 0;

			// split into keys
			while ( remaining.length ) {
				// find next dot
				index = remaining.indexOf( '.', startIndex );

				// final part?
				if ( index === -1 ) {
					// TODO tidy up!
					part = remaining;
					remaining = '';
				}

				else {
					// if this dot is preceded by a backslash, which isn't
					// itself preceded by a backslash, we consider it escaped
					if ( remaining.charAt( index - 1) === '\\' && remaining.charAt( index - 2 ) !== '\\' ) {
						// we don't want to keep this part, we want to keep looking
						// for the separator
						startIndex = index + 1;
						continue;
					}

					// otherwise, we have our next part
					part = remaining.substr( 0, index );
					startIndex = 0;
				}

				if ( /\[/.test( part ) ) {
					keys = keys.concat( part.replace( /\[\s*([0-9]+)\s*\]/g, '.$1' ).split( '.' ) );
				} else {
					keys[ keys.length ] = part;
				}
				
				remaining = remaining.substring( index + 1 );
			}

			
			// then, reinstate formatters
			if ( hasFormatters ) {
				replacer = function ( match ) {
					return '⭆' + formatters.pop() + '⭅';
				};

				i = keys.length;
				while ( i-- ) {
					if ( keys[i] === '⭆x⭅' ) {
						keys[i] = '⭆' + formatters.pop() + '⭅';
					}
				}
			}

			return keys;
		},

		getFormattersFromString: function ( str ) {
			var formatters, raw, remaining;

			if ( formattersCache[ str ] ) {
				return formattersCache[ str ];
			}

			raw = str.split( '⤋' );

			formatters = raw.map( function ( str ) {
				var index;

				index = str.indexOf( '[' );

				if ( index === -1 ) {
					return {
						name: str,
						args: []
					};
				}

				return {
					name: str.substr( 0, index ),
					args: JSON.parse( str.substring( index ) )
				};
			});

			formattersCache[ str ] = formatters;
			return formatters;
		},

		stringifyFormatters: function ( formatters ) {
			var stringified = formatters.map( function ( formatter ) {
				if ( formatter.args && formatter.args.length ) {
					return formatter.name + JSON.stringify( formatter.args );
				}

				return formatter.name;
			});

			return '⭆' + stringified.join( '⤋' ) + '⭅';
		}
	};

}());