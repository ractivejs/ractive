import { YIELDER } from '../../../config/types';
import readExpression from '../readExpression';
import refineExpression from '../../utils/refineExpression';
import { readAliases } from './readAliases';

const yieldPattern = /^yield\s*/;

export default function readYielder ( parser, tag ) {
	let expression;
	let aliases;
	let partial = { t: YIELDER };

	if ( !parser.matchPattern( yieldPattern ) ) return null;

	if ( !( aliases = parser.matchString( 'with' ) ) ) {
		// Partial names can include hyphens, so we can't use readExpression
		// blindly. Instead, we use the `relaxedNames` flag to indicate that
		// `foo-bar` should be read as a single name, rather than 'subtract
		// bar from foo'
		parser.relaxedNames = parser.strictRefinement = true;
		expression = readExpression( parser );
		parser.relaxedNames = parser.strictRefinement = false;

		if ( expression ) {
			refineExpression( expression, partial );
		}
	}

	parser.allowWhitespace();

	if ( aliases ) {
		aliases = readAliases( parser );
		if ( !aliases || !aliases.length ) parser.error( `expected one or more aliases` );
	}

	parser.allowWhitespace();

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `expected legal partial name` );
	}

	if ( name ) partial.r = expression;
	if ( aliases ) partial.z = aliases;

	return partial;
}
