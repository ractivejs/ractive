import cleanCss from '../../../../utils/cleanCss';

const selectorsPattern = /(?:^|\}|\{)\s*([^\{\}\0]+)\s*(?=\{)/g;
const keyframesDeclarationPattern = /@keyframes\s+[^\{\}]+\s*\{(?:[^{}]+|\{[^{}]+})*}/gi;
const selectorUnitPattern = /((?:(?:\[[^\]]+\])|(?:[^\s\+\>~:]))+)((?:::?[^\s\+\>\~\(:]+(?:\([^\)]+\))?)*\s*[\s\+\>\~]?)\s*/g;
const excludePattern = /^(?:@|\d+%)/;
const dataRvcGuidPattern = /\[data-ractive-css~="\{[a-z0-9-]+\}"]/g;

function trim ( str ) {
	return str.trim();
}

function extractString ( unit ) {
	return unit.str;
}

function transformSelector ( selector, parent ) {
	const selectorUnits = [];
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

	const transformed = [];
	let i = selectorUnits.length;

	while ( i-- ) {
		const appended = base.slice();

		// Pseudo-selectors should go after the attribute selector
		const unit = selectorUnits[i];
		appended[i] = unit.base + parent + unit.modifiers || '';

		const prepended = base.slice();
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
		transformed = cleanCss( css, ( css, reconstruct ) => {
			css = css.replace( selectorsPattern, ( match, $1 ) => {
				// don't transform at-rules and keyframe declarations
				if ( excludePattern.test( $1 ) ) return match;

				const selectors = $1.split( ',' ).map( trim );
				const transformed = selectors
					.map( selector => transformSelector( selector, dataAttr ) )
					.join( ', ' ) + ' ';

				return match.replace( $1, transformed );
			});

			return reconstruct( css );
		}, [ keyframesDeclarationPattern ]);
	}

	return transformed;
}
