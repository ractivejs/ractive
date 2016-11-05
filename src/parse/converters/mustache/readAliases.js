import readExpression from '../readExpression';
import refineExpression from '../../utils/refineExpression';

const legalAlias = /^(?:[a-zA-Z$_0-9]|\\\.)+(?:(?:(?:[a-zA-Z$_0-9]|\\\.)+)|(?:\[[0-9]+\]))*/;
const asRE = /^as/i;

export function readAliases( parser ) {
	const aliases = [];
	let alias;
	const start = parser.pos;

	parser.allowWhitespace();

	alias = readAlias( parser );

	if ( alias ) {
		alias.x = refineExpression( alias.x, {} );
		aliases.push( alias );

		parser.allowWhitespace();

		while ( parser.matchString(',') ) {
			alias = readAlias( parser );

			if ( !alias ) {
				parser.error( 'Expected another alias.' );
			}

			alias.x = refineExpression( alias.x, {} );
			aliases.push( alias );

			parser.allowWhitespace();
		}

		return aliases;
	}

	parser.pos = start;
	return null;
}

export function readAlias( parser ) {
	const start = parser.pos;

	parser.allowWhitespace();

	const expr = readExpression( parser, [] );

	if ( !expr ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	if ( !parser.matchPattern( asRE ) ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	const alias = parser.matchPattern( legalAlias );

	if ( !alias ) {
		parser.error( 'Expected a legal alias name.' );
	}

	return { n: alias, x: expr };
}
