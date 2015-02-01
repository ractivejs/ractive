import { PARTIAL, REFERENCE, SECTION, SECTION_WITH } from 'config/types';
import readExpression from 'parse/converters/readExpression';
import refineExpression from 'parse/utils/refineExpression';

var hyphenatedPattern = /^[a-zA-Z0-9_$]+[a-zA-Z0-9_$\-]*/;

export default function readPartial ( parser, delimiters ) {
	var expression, name, partial, contextExpression;

	if ( !parser.matchString( '>' ) ) {
		return null;
	}

	parser.allowWhitespace();

	// Partial names can include hyphens, so we can't use readExpression blindly
	name = parser.matchPattern( hyphenatedPattern );

	if ( name ) {
		expression = { t: REFERENCE, n: name };
	} else {
		expression = readExpression( parser );
	}

	if ( !expression ) {
		return null;
	}

	partial = { t: PARTIAL };
	refineExpression( expression, partial ); // TODO...

	parser.allowWhitespace();

	// if we have another expression - e.g. `{{>foo bar}}` - then
	// we turn it into `{{#with bar}}{{>foo}}{{/with}}`
	if ( contextExpression = readExpression( parser ) ) {
		partial = {
			t: SECTION,
			n: SECTION_WITH,
			f: [ partial ]
		};

		refineExpression( contextExpression, partial );
	}

	if ( !parser.matchString( delimiters.content[1] ) ) {
		parser.error( `Expected closing delimiter '${delimiters.content[1]}'` );
	}

	return partial;
}