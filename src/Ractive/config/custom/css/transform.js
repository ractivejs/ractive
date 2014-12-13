var selectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g,
	commentsPattern = /\/\*.*?\*\//g,
	selectorUnitPattern = /((?:(?:\[[^\]+]\])|(?:[^\s\+\>\~:]))+)((?::[^\s\+\>\~\(]+(?:\([^\)]+\))?)?\s*[\s\+\>\~]?)\s*/g,
	mediaQueryPattern = /^@media/,
	dataRvcGuidPattern = /\[data-ractive-css="[a-z0-9-]+"]/g;

export default function transformCss( css, id ) {
	var transformed, dataAttr, addGuid;

	dataAttr = `[data-ractive-css="${id}"]`;

	addGuid = function ( selector ) {
		var selectorUnits, match, unit, base, prepended, appended, i, transformed = [];

		selectorUnits = [];

		while ( match = selectorUnitPattern.exec( selector ) ) {
			selectorUnits.push({
				str: match[0],
				base: match[1],
				modifiers: match[2]
			});
		}

		// For each simple selector within the selector, we need to create a version
		// that a) combines with the id, and b) is inside the id
		base = selectorUnits.map( extractString );

		i = selectorUnits.length;
		while ( i-- ) {
			appended = base.slice();

			// Pseudo-selectors should go after the attribute selector
			unit = selectorUnits[i];
			appended[i] = unit.base + dataAttr + unit.modifiers || '';

			prepended = base.slice();
			prepended[i] = dataAttr + ' ' + prepended[i];

			transformed.push( appended.join( ' ' ), prepended.join( ' ' ) );
		}

		return transformed.join( ', ' );
	};

	if ( dataRvcGuidPattern.test( css ) ) {
		transformed = css.replace( dataRvcGuidPattern, dataAttr );
	} else {
		transformed = css
		.replace( commentsPattern, '' )
		.replace( selectorsPattern, function ( match, $1 ) {
			var selectors, transformed;

			// don't transform media queries!
			if ( mediaQueryPattern.test( $1 ) ) return match;

			selectors = $1.split( ',' ).map( trim );
			transformed = selectors.map( addGuid ).join( ', ' ) + ' ';

			return match.replace( $1, transformed );
		});
	}

	return transformed;
}

function trim ( str ) {
	if ( str.trim ) {
		return str.trim();
	}

	return str.replace( /^\s+/, '' ).replace( /\s+$/, '' );
}

function extractString ( unit ) {
	return unit.str;
}
