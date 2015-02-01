import { DELIMCHANGE } from 'config/types';
import readDelimiterChange from './mustache/readDelimiterChange';

var delimiterChangeToken = { t: DELIMCHANGE, exclude: true };

export default getMustache;

function getMustache ( parser ) {
	var mustache, i;

	// If we're inside a <script> or <style> tag, and we're not
	// interpolating, bug out
	if ( parser.interpolate[ parser.inside ] === false ) {
		return null;
	}

	for ( i = 0; i < parser.delimiters.length; i += 1 ) {
		if ( mustache = getMustacheOfType( parser, parser.delimiters[i] ) ) {
			return mustache;
		}
	}
}

function getMustacheOfType ( parser, delimiters ) {
	var start, mustache, reader, i;

	start = parser.pos;

	if ( !parser.matchString( delimiters.content[0] ) ) {
		return null;
	}

	// delimiter change?
	if ( mustache = readDelimiterChange( parser ) ) {
		// find closing delimiter or abort...
		if ( !parser.matchString( delimiters.content[1] ) ) {
			return null;
		}

		// ...then make the switch
		delimiters.content = mustache;
		parser.sortDelimiters();

		return delimiterChangeToken;
	}

	parser.allowWhitespace();

	// illegal section closer
	if ( parser.matchString( '/' ) ) {
		parser.pos -= ( delimiters.content[1].length + 1 );
		parser.error( 'Attempted to close a section that wasn\'t open' );
	}

	for ( i = 0; i < delimiters.readers.length; i += 1 ) {
		reader = delimiters.readers[i];

		if ( mustache = reader( parser, delimiters ) ) {
			if ( delimiters.isStatic ) {
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
