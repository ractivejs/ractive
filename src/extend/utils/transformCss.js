define( function () {

	'use strict';

	return function transformCss( css, guid ) {
		var selectorsPattern, transformed, appendGuid, prependGuid;

		selectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g;

		appendGuid = function ( str ) {
			return str + '[data-rvcguid="' + guid + '"]';
		};

		prependGuid = function ( str ) {
			return '[data-rvcguid="' + guid + '"] ' + str;
		};

		transformed = css.replace( selectorsPattern, function ( match, $1 ) {
			var selectors, transformed;

			selectors = $1.split( ',' ).map( trim );
			transformed = selectors.map( appendGuid ).concat( selectors.map( prependGuid ) ).join( ', ' ) + ' ';

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

});
