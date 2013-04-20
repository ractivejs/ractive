(function () {

	'use strict';

	var modifiersCache = {}, keypathCache = {};

	_internal = {
		// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
		isArray: function ( obj ) {
			return Object.prototype.toString.call( obj ) === '[object Array]';
		},

		isObject: function ( obj ) {
			return ( Object.prototype.toString.call( obj ) === '[object Object]' ) && ( typeof obj !== 'function' );
		},

		// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
		isNumeric: function ( n ) {
			return !isNaN( parseFloat( n ) ) && isFinite( n );
		},

		splitKeypath: function ( keypath ) {
			var hasModifiers, modifiers, i, index, startIndex, keys, remaining, part;

			// We should only have to do all the heavy regex stuff once... caching FTW
			if ( keypathCache[ keypath ] ) {
				return keypathCache[ keypath ].concat();
			}

			// If this string contains no escaped dots or modifiers,
			// we can just split on dots, after converting from array notation
			hasModifiers = /⭆.+⭅/.test( keypath );
			if ( !( /\\\./.test( keypath ) ) && !hasModifiers ) {
				keypathCache[ keypath ] = keypath.replace( /\[\s*([0-9]+)\s*\]/g, '.$1' ).split( '.' );
				return keypathCache[ keypath ].concat();
			}

			keys = [];
			remaining = keypath;
			
			// first, blank modifiers in case they contain dots, but store them
			// so we can reinstate them later
			if ( hasModifiers ) {
				modifiers = [];
				remaining = remaining.replace( /⭆(.+)⭅/g, function ( match, $1 ) {
					modifiers[ modifiers.length ] = $1;
					return '⭆x⭅';
				});
			}
			

			startIndex = 0;

			// Split into keys
			while ( remaining.length ) {
				// Find next dot
				index = remaining.indexOf( '.', startIndex );

				// Final part?
				if ( index === -1 ) {
					part = remaining;
					remaining = '';
				}

				else {
					// If this dot is preceded by a backslash, which isn't
					// itself preceded by a backslash, we consider it escaped
					if ( remaining.charAt( index - 1) === '\\' && remaining.charAt( index - 2 ) !== '\\' ) {
						// we don't want to keep this part, we want to keep looking
						// for the separator
						startIndex = index + 1;
						continue;
					}

					// Otherwise, we have our next part
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

			
			// Then, reinstate modifiers
			if ( hasModifiers ) {
				i = keys.length;
				while ( i-- ) {
					if ( keys[i] === '⭆x⭅' ) {
						keys[i] = '⭆' + modifiers.pop() + '⭅';
					}
				}
			}

			keypathCache[ keypath ] = keys;
			return keys.concat();
		},

		getModifiersFromString: function ( str ) {
			var modifiers, raw;

			if ( modifiersCache[ str ] ) {
				return modifiersCache[ str ];
			}

			raw = str.split( '⤋' );

			modifiers = raw.map( function ( str ) {
				var index;

				index = str.indexOf( '[' );

				if ( index === -1 ) {
					return {
						d: str,
						g: []
					};
				}

				return {
					d: str.substr( 0, index ),
					g: JSON.parse( str.substring( index ) )
				};
			});

			modifiersCache[ str ] = modifiers;
			return modifiers;
		},

		stringifyModifiers: function ( modifiers ) {
			var stringified = modifiers.map( function ( modifier ) {
				if ( modifier.g && modifier.g.length ) {
					return modifier.d + JSON.stringify( modifier.g );
				}

				return modifier.d;
			});

			return '⭆' + stringified.join( '⤋' ) + '⭅';
		}
	};

}());