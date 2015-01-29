import getLowestIndex from '../utils/getLowestIndex';
import readMustache from '../readMustache';
import { decodeCharacterReferences } from 'utils/html';

var attributeNamePattern = /^[^\s"'>\/=]+/,
	unquotedAttributeValueTextPattern = /^[^\s"'=<>`]+/;

export default function readAttribute ( parser ) {
	var attr, name, value;

	parser.allowWhitespace();

	name = parser.matchPattern( attributeNamePattern );
	if ( !name ) {
		return null;
	}

	attr = {
		name: name
	};

	value = readAttributeValue( parser );
	if ( value ) {
		attr.value = value;
	}

	return attr;
}

function readAttributeValue ( parser ) {
	var start, valueStart, startDepth, value;

	start = parser.pos;

	parser.allowWhitespace();

	if ( !parser.matchString( '=' ) ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	valueStart = parser.pos;
	startDepth = parser.sectionDepth;

	value = readQuotedAttributeValue( parser, "'" ) ||
			readQuotedAttributeValue( parser, '"' ) ||
			readUnquotedAttributeValue( parser );

	if ( parser.sectionDepth !== startDepth ) {
		parser.pos = valueStart;
		parser.error( 'An attribute value must contain as many opening section tags as closing section tags' );
	}

	if ( value === null ) {
		parser.pos = start;
		return null;
	}

	if ( !value.length ) {
		return null;
	}

	if ( value.length === 1 && typeof value[0] === 'string' ) {
		return decodeCharacterReferences( value[0] );
	}

	return value;
}

function readUnquotedAttributeValueToken ( parser ) {
	var start, text, haystack, needles, index;

	start = parser.pos;

	text = parser.matchPattern( unquotedAttributeValueTextPattern );

	if ( !text ) {
		return null;
	}

	haystack = text;
	needles = [
		parser.delimiters[0],
		parser.tripleDelimiters[0],
		parser.staticDelimiters[0],
		parser.staticTripleDelimiters[0]
	];

	if ( ( index = getLowestIndex( haystack, needles ) ) !== -1 ) {
		text = text.substr( 0, index );
		parser.pos = start + text.length;
	}

	return text;
}

function readUnquotedAttributeValue ( parser ) {
	var tokens, token;

	parser.inAttribute = true;

	tokens = [];

	token = readMustache( parser ) || readUnquotedAttributeValueToken( parser );
	while ( token !== null ) {
		tokens.push( token );
		token = readMustache( parser ) || readUnquotedAttributeValueToken( parser );
	}

	if ( !tokens.length ) {
		return null;
	}

	parser.inAttribute = false;
	return tokens;
}

function readQuotedAttributeValue ( parser, quoteMark ) {
	var start, tokens, token;

	start = parser.pos;

	if ( !parser.matchString( quoteMark ) ) {
		return null;
	}

	parser.inAttribute = quoteMark;

	tokens = [];

	token = readMustache( parser ) || readQuotedStringToken( parser, quoteMark );
	while ( token !== null ) {
		tokens.push( token );
		token = readMustache( parser ) || readQuotedStringToken( parser, quoteMark );
	}

	if ( !parser.matchString( quoteMark ) ) {
		parser.pos = start;
		return null;
	}

	parser.inAttribute = false;

	return tokens;
}

function readQuotedStringToken ( parser, quoteMark ) {
	var start, index, haystack, needles;

	start = parser.pos;
	haystack = parser.remaining();

	needles = [
		quoteMark,
		parser.delimiters[0],
		parser.tripleDelimiters[0],
		parser.staticDelimiters[0],
		parser.staticTripleDelimiters[0]
	];

	index = getLowestIndex( haystack, needles );

	if ( index === -1 ) {
		parser.error( 'Quoted attribute value must have a closing quote' );
	}

	if ( !index ) {
		return null;
	}

	parser.pos += index;
	return haystack.substr( 0, index );
}
