import { CATCH, ELSE, ELSEIF, THEN } from 'config/types';
import readExpression from '../../readExpression';
import { name } from '../../expressions/shared/patterns';

const patterns = {
	else: /^\s*else\s*/,
	elseif: /^\s*elseif\s+/,
	then: /^\s*then\s*/,
	catch: /^\s*catch\s*/
};

const types = {
	else: ELSE,
	elseif: ELSEIF,
	then: THEN,
	catch: CATCH
};

export default function readInlineBlock ( parser, tag, type ) {
	const start = parser.pos;

	if ( !parser.matchString( tag.open ) ) {
		return null;
	}

	if ( !parser.matchPattern( patterns[type] ) ) {
		parser.pos = start;
		return null;
	}

	const res = { t: types[type] };

	if ( type === 'elseif' ) {
		res.x = readExpression( parser );
	} else if (type === 'catch' || type === 'then' ) {
		const nm = parser.matchPattern( name );
		if ( nm ) res.n = nm;
	}

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	return res;
}
