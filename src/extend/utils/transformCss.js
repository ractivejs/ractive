define( function () {

	'use strict';

	var selectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g,
		pseudoSelectorPattern = /([^:]*)(::?[^:]+)?/;

	return function transformCss( css, guid ) {
		var transformed, addGuid;

		addGuid = function ( selector ) {
			var simpleSelectors, dataAttr, prepended, appended, pseudo, i, transformed = [];

			// For each simple selector within the selector, we need to create a version
			// that a) combines with the guid, and b) is inside the guid
			simpleSelectors = selector.split( ' ' ).filter( excludeEmpty );
			dataAttr = '[data-rvcguid="' + guid + '"]';

			i = simpleSelectors.length;
			while ( i-- ) {
				appended = simpleSelectors.slice();

				// Pseudo-selectors should go after the attribute selector
				pseudo = pseudoSelectorPattern.exec( appended[i] );
				appended[i] = pseudo[1] + dataAttr + ( pseudo[2] || '' );

				prepended = simpleSelectors.slice();
				prepended[i] = dataAttr + ' ' + prepended[i];

				transformed.push( appended.join( ' ' ), prepended.join( ' ' ) );
			}

			return transformed.join( ', ' );
		};

		transformed = css.replace( selectorsPattern, function ( match, $1 ) {
			var selectors, transformed;

			selectors = $1.split( ',' ).map( trim );
			transformed = selectors.map( addGuid ).join( ', ' ) + ' ';

			return match.replace( $1, transformed );
		});

		return transformed;
	};

	function trim ( str ) {
		if ( str.trim ) {
			return str.trim();
		}

		return str.replace( /^\s+/, '' ).replace( /\s+$/, '' );
	}

	function excludeEmpty ( str ) {
		// remove items that contain only whitespace
		return !/^\s*$/.test( str );
	}

});
