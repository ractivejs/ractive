import { PARTIAL, SECTION, SECTION_WITH, ALIAS } from '../../../config/types';
import readExpression from '../readExpression';
import refineExpression from '../../utils/refineExpression';
import { readAliases } from './readAliases';

export default function readPartial ( parser, tag ) {
	if ( !parser.matchString( '>' ) ) return null;

	parser.allowWhitespace();

	// Partial names can include hyphens, so we can't use readExpression
	// blindly. Instead, we use the `relaxedNames` flag to indicate that
	// `foo-bar` should be read as a single name, rather than 'subtract
	// bar from foo'
	parser.relaxedNames = parser.strictRefinement = true;
	const expression = readExpression( parser );
	parser.relaxedNames = parser.strictRefinement = false;

	if ( !expression ) return null;

	let partial = { t: PARTIAL };
	refineExpression( expression, partial ); // TODO...

	parser.allowWhitespace();

	// check for alias context e.g. `{{>foo bar as bat, bip as bop}}` then
	// turn it into `{{#with bar as bat, bip as bop}}{{>foo}}{{/with}}`
	const aliases = readAliases( parser );
	if ( aliases ) {
		partial.z = aliases;
	}

	// otherwise check for literal context e.g. `{{>foo bar}}` then
	// turn it into `{{#with bar}}{{>foo}}{{/with}}`
	else {
		const context = readExpression( parser );
		if ( context) {
			partial.c = {};
			refineExpression( context, partial.c );
		}
	}

	parser.allowWhitespace();

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	return partial;
}
