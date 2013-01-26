(function ( A ) {

	'use strict';

	var types = A.types;

	var utils = A.utils = {
		// Returns the specified DOM node
		getEl: function ( input ) {
			var output;

			if ( !input ) {
				throw new Error( 'No container element specified' );
			}

			// We already have a DOM node - no work to do
			if ( input.tagName ) {
				return input;
			}

			// Get node from string
			if ( typeof input === 'string' ) {
				output = document.getElementById( input );

				if ( output.tagName ) {
					return output;
				}
			}

			throw new Error( 'Could not find container element' );
		},


		// Split keypath ('foo.bar.baz[0]') into keys (['foo', 'bar', 'baz', 0])
		splitKeypath: function ( keypath ) {
			var firstPass, secondPass = [], i;

			// Start by splitting on periods
			firstPass = keypath.split( '.' );

			// Then see if any keys use array notation instead of dot notation
			for ( i=0; i<firstPass.length; i+=1 ) {
				secondPass = secondPass.concat( utils.parseArrayNotation( firstPass[i] ) );
			}

			return secondPass;
		},

		// Split key with array notation ('baz[0]') into identifier and array pointer(s) (['baz', 0])
		parseArrayNotation: function ( key ) {
			var index, arrayPointers, pattern, match, result;

			index = key.indexOf( '[' );

			if ( index === -1 ) {
				return key;
			}

			result = [ key.substr( 0, index ) ];
			arrayPointers = key.substring( index );

			pattern = A.patterns.arrayPointer;

			while ( arrayPointers.length ) {
				match = pattern.exec( arrayPointers );

				if ( !match ) {
					return result;
				}

				result[ result.length ] = +match[1];
				arrayPointers = arrayPointers.substring( match[0].length );
			}

			return result;
		},



		// CAUTION! HERE BE REGEXES
		escape: function ( str ) {
			var theSpecials = /[\[\]\(\)\{\}\^\$\*\+\?\.\|]/g;

			// escaped characters need an extra backslash
			return str.replace( theSpecials, '\\$&' );
		},

		


		stripHtmlComments: function ( str ) {
			var commentStart, commentEnd, processed;

			processed = '';

			while ( str.length ) {
				commentStart = str.indexOf( '<!--' );
				commentEnd = str.indexOf( '-->' );

				// no comments? great
				if ( commentStart === -1 && commentEnd === -1 ) {
					processed += str;
					break;
				}

				// comment start but no comment end
				if ( commentStart !== -1 && commentEnd === -1 ) {
					throw 'Illegal HTML - expected closing comment sequence (\'-->\')';
				}

				// comment end but no comment start, or comment end before comment start
				if ( ( commentEnd !== -1 && commentStart === -1 ) || ( commentEnd < commentStart ) ) {
					throw 'Illegal HTML - unexpected closing comment sequence (\'-->\')';
				}

				processed += str.substr( 0, commentStart );
				str = str.substring( commentEnd + 3 );
			}

			return processed;
		},


		

		// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
		isArray: function ( obj ) {
			return Object.prototype.toString.call( obj ) === '[object Array]';
		},

		isObject: function ( obj ) {
			return ( Object.prototype.toString.call( obj ) === '[object Object]' ) && ( typeof obj !== 'function' );
		},


		insertHtml: function ( html, parent, anchor ) {
			var div, i, len, nodes = [];

			anchor = anchor || null;

			div = document.createElement( 'div' );
			div.innerHTML = html;

			len = div.childNodes.length;

			for ( i=0; i<len; i+=1 ) {
				nodes[i] = div.childNodes[i];
			}

			for ( i=0; i<len; i+=1 ) {
				parent.insertBefore( nodes[i], anchor );
			}

			return nodes;
		}
	};


	(function() {
		var vendors = ['ms', 'moz', 'webkit', 'o'], i, tryVendor;
		
		if ( window.requestAnimationFrame ) {
			utils.wait = function ( task ) {
				window.requestAnimationFrame( task );
			};
			return;
		}

		tryVendor = function ( i ) {
			if ( window[ vendors[i]+'RequestAnimationFrame' ] ) {
				utils.wait = function ( task ) {
					window[ vendors[i]+'RequestAnimationFrame' ]( task );
				};
				return;
			}
		};

		for ( i=0; i<vendors.length; i+=1 ) {
			tryVendor( i );
		}

		utils.wait = function( task ) {
			setTimeout( task, 16 );
		};
	}());

}( Anglebars ));