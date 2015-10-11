const selectorsPattern = /(?:^|\})?\s*([^\{\}]+)\s*\{/g;
const commentsPattern = /\/\*.*?\*\//g;
const selectorUnitPattern = /((?:(?:\[[^\]+]\])|(?:[^\s\+\>~:]))+)((?::[^\s\+\>\~\(:]+(?:\([^\)]+\))?)*\s*[\s\+\>\~]?)\s*/g;
const mediaQueryPattern = /^@media/;
const dataRvcGuidPattern = /\[data-ractive-css~="\{[a-z0-9-]+\}"]/g;

function trim ( str ) {
	return str.trim();
}

function extractString ( unit ) {
	return unit.str;
}

function transformSelector ( selector, parent ) {
	let selectorUnits = [];
	let match;

	while ( match = selectorUnitPattern.exec( selector ) ) {
		selectorUnits.push({
			str: match[0],
			base: match[1],
			modifiers: match[2]
		});
	}

	// For each simple selector within the selector, we need to create a version
	// that a) combines with the id, and b) is inside the id
	const base = selectorUnits.map( extractString );

	let transformed = [];
	let i = selectorUnits.length;

	while ( i-- ) {
		let appended = base.slice();

		// Pseudo-selectors should go after the attribute selector
		const unit = selectorUnits[i];
		appended[i] = unit.base + parent + unit.modifiers || '';

		let prepended = base.slice();
		prepended[i] = parent + ' ' + prepended[i];

		transformed.push( appended.join( ' ' ), prepended.join( ' ' ) );
	}

	return transformed.join( ', ' );
}

export default function transformCss ( css, id ) {
	const dataAttr = `[data-ractive-css~="{${id}}"]`;

	let transformed;

	if ( dataRvcGuidPattern.test( css ) ) {
		transformed = css.replace( dataRvcGuidPattern, dataAttr );
	} else {
		transformed = css
		.replace( commentsPattern, '' )
		.replace( selectorsPattern, ( match, $1 ) => {
			// don't transform media queries!
			if ( mediaQueryPattern.test( $1 ) ) return match;

			const selectors = $1.split( ',' ).map( trim );
			const transformed = selectors
				.map( selector => transformSelector( selector, dataAttr ) )
				.join( ', ' ) + ' ';

			return match.replace( $1, transformed );
		});
	}

	return transformed;
}
