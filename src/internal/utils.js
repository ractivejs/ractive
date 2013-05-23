splitKeypath =  function ( keypath ) {
	var index, startIndex, keys, remaining, part;

	// We should only have to do all the heavy regex stuff once... caching FTW
	if ( keypathCache[ keypath ] ) {
		return keypathCache[ keypath ].concat();
	}

	keys = [];
	remaining = keypath;
	
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

	
	keypathCache[ keypath ] = keys;
	return keys.concat();
};



// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
isArray = function ( obj ) {
	return Object.prototype.toString.call( obj ) === '[object Array]';
};

isEqual = function ( a, b ) {
	if ( a === null && b === null ) {
		return true;
	}

	if ( typeof a === 'object' || typeof b === 'object' ) {
		return false;
	}

	return a === b;
};

// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
isNumeric = function ( n ) {
	return !isNaN( parseFloat( n ) ) && isFinite( n );
};

isObject = function ( obj ) {
	return ( Object.prototype.toString.call( obj ) === '[object Object]' ) && ( typeof obj !== 'function' );
};


	
getEl = function ( input ) {
	var output, doc;

	if ( typeof window === 'undefined' ) {
		return;
	}

	doc = window.document;

	if ( !input ) {
		throw new Error( 'No container element specified' );
	}

	// We already have a DOM node - no work to do
	if ( input.tagName ) {
		return input;
	}

	// Get node from string
	if ( typeof input === 'string' ) {
		// try ID first
		output = doc.getElementById( input );

		// then as selector, if possible
		if ( !output && doc.querySelector ) {
			output = doc.querySelector( input );
		}

		// did it work?
		if ( output.tagName ) {
			return output;
		}
	}

	// If we've been given a collection (jQuery, Zepto etc), extract the first item
	if ( input[0] && input[0].tagName ) {
		return input[0];
	}

	throw new Error( 'Could not find container element' );
};