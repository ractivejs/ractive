define( function () {

	'use strict';

	return function transformCss( css, guid ) {
		var selectorsPattern, match, transformed, appendGuid, prependGuid;

		console.group( 'transforming css' );
		console.log( css );

		selectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g;

		appendGuid = function ( str ) {
			return str + '[data-rvcguid="' + guid + '"]';
		};

		prependGuid = function ( str ) {
			return '[data-rvcguid="' + guid + '"] ' + str;
		};

		transformed = css.replace( selectorsPattern, function ( match, $1 ) {
			var selectors, transformed;

			console.group( 'transforming selectors' );
			console.log( 'match: "%s"', match );
			console.log( 'selectors: "%s"', $1 );

			selectors = $1.split( ',' ).map( trim );
			console.log( 'selectors: ', selectors );
			transformed = selectors.map( appendGuid ).concat( selectors.map( prependGuid ) ).join( ', ' ) + ' ';
			console.log( 'transformed:', transformed );
			console.groupEnd();

			return match.replace( $1, transformed );
		});

		console.log( 'transformed:\n' + transformed );
		console.groupEnd();

		return transformed;
	};

	function trim ( str ) {
		if ( str.trim ) {
			return str.trim();
		}

		return str.replace( /^\s+/, '' ).replace( /\s+$/, '' );
	}

});
