import { DELIMCHANGE } from '../../constants/types';
import readDelimiterChange from './mustache/readDelimiterChange';
import readRegexpLiteral from './expressions/primary/literal/readRegexpLiteral';

var delimiterChangeToken = { t: DELIMCHANGE, exclude: true };

export default function readMustache ( parser ) {
	var mustache, i;

	// If we're inside a <script> or <style> tag, and we're not
	// interpolating, bug out
	if ( parser.interpolate[ parser.inside ] === false ) {
		return null;
	}

	for ( i = 0; i < parser.tags.length; i += 1 ) {
		if ( mustache = readMustacheOfType( parser, parser.tags[i] ) ) {
			return mustache;
		}
	}
}

function readMustacheOfType ( parser, tag ) {
	var start, mustache, reader, i;

	start = parser.pos;

	if ( parser.matchString( '\\' + tag.open ) ) {
		if ( start === 0 || parser.str[ start - 1 ] !== '\\' ) {
			return tag.open;
		}
	} else if ( !parser.matchString( tag.open ) ) {
		return null;
	}

	// delimiter change?
	if ( mustache = readDelimiterChange( parser ) ) {
		// find closing delimiter or abort...
		if ( !parser.matchString( tag.close ) ) {
			return null;
		}

		// ...then make the switch
		tag.open = mustache[0];
		tag.close = mustache[1];
		parser.sortMustacheTags();

		return delimiterChangeToken;
	}

	parser.allowWhitespace();

	// illegal section closer
	if ( parser.matchString( '/' ) ) {
		parser.pos -= 1;
		let rewind = parser.pos;
		if ( !readRegexpLiteral( parser ) ) {
			parser.pos = rewind - ( tag.close.length );
			parser.error( 'Attempted to close a section that wasn\'t open' );
		} else {
			parser.pos = rewind;
		}
	}

	for ( i = 0; i < tag.readers.length; i += 1 ) {
		reader = tag.readers[i];

		if ( mustache = reader( parser, tag ) ) {
			if ( tag.isStatic ) {
				mustache.s = true; // TODO make this `1` instead - more compact
			}

			if ( parser.includeLinePositions ) {
				mustache.p = parser.getLinePos( start );
			}

			return mustache;
		}
	}

	parser.pos = start;
	return null;
}
