import { PARTIAL, SECTION, SECTION_WITH } from 'config/types';
import readExpression from 'parse/converters/readExpression';
import refineExpression from 'parse/utils/refineExpression';

export default function readPartial ( parser, delimiters ) {
	var start, nameStart, expression, context, partial;

	start = parser.pos;

	if ( !parser.matchString( '>' ) ) {
		return null;
	}

	parser.allowWhitespace();
	nameStart = parser.pos;

	// Partial names can include hyphens, so we can't use readExpression
	// blindly. Instead, we use the `relaxedNames` flag to indicate that
	// `foo-bar` should be read as a single name, rather than 'subtract
	// bar from foo'
	parser.relaxedNames = true;
	expression = readExpression( parser );
	parser.relaxedNames = false;

	parser.allowWhitespace();
	context = readExpression( parser );
	parser.allowWhitespace();

	if ( !expression ) {
		return null;
	}

	partial = { t: PARTIAL };
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

	if ( !parser.matchString( delimiters.content[1] ) ) {
		parser.error( `Expected closing delimiter '${delimiters.content[1]}'` );
	}

	return partial;
}