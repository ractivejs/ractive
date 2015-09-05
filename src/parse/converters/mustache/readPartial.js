import { PARTIAL, SECTION, SECTION_WITH } from '../../../config/types';
import readExpression from '../readExpression';
import refineExpression from '../../utils/refineExpression';

export default function readPartial ( parser, tag ) {
	if ( !parser.matchString( '>' ) ) return null;

	parser.allowWhitespace();

	// Partial names can include hyphens, so we can't use readExpression
	// blindly. Instead, we use the `relaxedNames` flag to indicate that
	// `foo-bar` should be read as a single name, rather than 'subtract
	// bar from foo'
	parser.relaxedNames = true;
	const expression = readExpression( parser );
	parser.relaxedNames = false;

	parser.allowWhitespace();
	const context = readExpression( parser );
	parser.allowWhitespace();

	if ( !expression ) return null;

	let partial = { t: PARTIAL };
	refineExpression( expression, partial ); // TODO...

	parser.allowWhitespace();

	// if we have another expression - e.g. `{{>foo bar}}` - then
	// we turn it into `{{#with bar}}{{>foo}}{{/with}}`
	if ( context ) {
		partial = {
			t: SECTION,
			n: SECTION_WITH,
			f: [ partial ]
		};

		refineExpression( context, partial );
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	return partial;
}
