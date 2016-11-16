import { PARTIAL, YIELDER } from '../../../config/types';
import readExpression from '../readExpression';
import refineExpression from '../../utils/refineExpression';
import { readAliases } from './readAliases';

export default function readPartial ( parser, tag ) {
	const type = parser.matchString( '>' ) || parser.matchString( 'yield' );
	const partial = { t: type === '>' ? PARTIAL : YIELDER };
	let aliases;

	if ( !type ) return null;

	parser.allowWhitespace();

	if ( type === '>' || !( aliases = parser.matchString( 'with' ) ) ) {
		// Partial names can include hyphens, so we can't use readExpression
		// blindly. Instead, we use the `relaxedNames` flag to indicate that
		// `foo-bar` should be read as a single name, rather than 'subtract
		// bar from foo'
		parser.relaxedNames = parser.strictRefinement = true;
		const expression = readExpression( parser );
		parser.relaxedNames = parser.strictRefinement = false;

		if ( !expression && type === '>' ) return null;

		if ( expression ) {
			refineExpression( expression, partial ); // TODO...
			parser.allowWhitespace();
			if ( type !== '>' ) aliases = parser.matchString( 'with' );
		}
	}

	parser.allowWhitespace();

	// check for alias context e.g. `{{>foo bar as bat, bip as bop}}`
	if ( aliases || type === '>' ) {
		aliases = readAliases( parser );
		if ( aliases && aliases.length ) {
			partial.z = aliases;
		}

		// otherwise check for literal context e.g. `{{>foo bar}}` then
		// turn it into `{{#with bar}}{{>foo}}{{/with}}`
		else if ( type === '>' ) {
			const context = readExpression( parser );
			if ( context) {
				partial.c = {};
				refineExpression( context, partial.c );
			}
		}

		else {
			// {{yield with}} requires some aliases
			parser.error( `Expected one or more aliases` );
		}
	}

	parser.allowWhitespace();

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	return partial;
}
