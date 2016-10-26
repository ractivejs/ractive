import { ATTRIBUTE, DECORATOR, BINDING_FLAG, TRANSITION, EVENT } from '../../../config/types';
import getLowestIndex from '../utils/getLowestIndex';
import readMustache from '../readMustache';
import { decodeCharacterReferences } from '../../../utils/html';
import readExpressionList from '../expressions/shared/readExpressionList';
import flattenExpression from '../../utils/flattenExpression';
import { warnOnceIfDebug } from '../../../utils/log';

const attributeNamePattern = /^[^\s"'>\/=]+/,
	onPattern = /^on/,
	eventPattern = /^on-([a-zA-Z\\*\\.$_][a-zA-Z\\*\\.$_0-9\-]+)$/,
	reservedEventNames = /^(?:change|reset|teardown|update|construct|config|init|render|unrender|detach|insert)$/,
	decoratorPattern = /^as-([a-z-A-Z][-a-zA-Z_0-9]*)$/,
	transitionPattern = /^([a-zA-Z](?:(?!-in-out)[-a-zA-Z_0-9])*)-(in|out|in-out)$/,
	directives = {
				   lazy: { t: BINDING_FLAG, v: 'l' },
				   twoway: { t: BINDING_FLAG, v: 't' }
				 },
	unquotedAttributeValueTextPattern = /^[^\s"'=<>`]+/,
	proxyEvent = /^[^\s"'=<>@\[\]()]*/,
	whitespace = /^\s+/;

export default function readAttribute ( parser ) {
	var name, i, nearest, idx;

	parser.allowWhitespace();

	name = parser.matchPattern( attributeNamePattern );
	if ( !name ) {
		return null;
	}

	// check for accidental delimiter consumption e.g. <tag bool{{>attrs}} />
	nearest = name.length;
	for ( i = 0; i < parser.tags.length; i++ ) {
		if ( ~( idx = name.indexOf( parser.tags[ i ].open ) ) ) {
			if ( idx < nearest ) nearest = idx;
		}
	}
	if ( nearest < name.length ) {
		parser.pos -= name.length - nearest;
		name = name.substr( 0, nearest );
		return { n: name };
	}

	return { n: name };
}

function readAttributeValue ( parser ) {
	var start, valueStart, startDepth, value;

	start = parser.pos;

	// next character must be `=`, `/`, `>` or whitespace
	if ( !/[=\/>\s]/.test( parser.nextChar() ) ) {
		parser.error( 'Expected `=`, `/`, `>` or whitespace' );
	}

	parser.allowWhitespace();

	if ( !parser.matchString( '=' ) ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	valueStart = parser.pos;
	startDepth = parser.sectionDepth;

	value = readQuotedAttributeValue( parser, `'` ) ||
			readQuotedAttributeValue( parser, `"` ) ||
			readUnquotedAttributeValue( parser );

	if ( value === null ) {
		parser.error( 'Expected valid attribute value' );
	}

	if ( parser.sectionDepth !== startDepth ) {
		parser.pos = valueStart;
		parser.error( 'An attribute value must contain as many opening section tags as closing section tags' );
	}

	if ( !value.length ) {
		return '';
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
	needles = parser.tags.map( t => t.open ); // TODO refactor... we do this in readText.js as well

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
	while ( token ) {
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
	const haystack = parser.remaining();

	let needles = parser.tags.map( t => t.open ); // TODO refactor... we do this in readText.js as well
	needles.push( quoteMark );

	const index = getLowestIndex( haystack, needles );

	if ( index === -1 ) {
		parser.error( 'Quoted attribute value must have a closing quote' );
	}

	if ( !index ) {
		return null;
	}

	parser.pos += index;
	return haystack.substr( 0, index );
}

export function readAttributeOrDirective ( parser ) {
		var match,
			attribute,
		    directive;

		attribute = readAttribute( parser, false );

		if ( !attribute ) return null;

		// lazy, twoway
		if ( directive = directives[ attribute.n ] ) {
			attribute.t = directive.t;
			if ( directive.v ) attribute.v = directive.v;
			delete attribute.n; // no name necessary
			parser.allowWhitespace();
			if ( parser.nextChar() === '=' ) attribute.f = readAttributeValue( parser );
		}

		// decorators
		else if ( match = decoratorPattern.exec( attribute.n ) ) {
			attribute.n = match[1];
			attribute.t = DECORATOR;
			readArguments( parser, attribute );
		}

		// transitions
		else if ( match = transitionPattern.exec( attribute.n ) ) {
			attribute.n = match[1];
			attribute.t = TRANSITION;
			readArguments( parser, attribute );
			attribute.v = match[2] === 'in-out' ? 't0' : match[2] === 'in' ? 't1' : 't2';
		}

		// on-click etc
		else if ( match = eventPattern.exec( attribute.n ) ) {
			attribute.n = match[1];
			attribute.t = EVENT;

			// check for a proxy event
			if ( !readProxyEvent( parser, attribute ) ) {
				// otherwise, it's an expression
				readArguments( parser, attribute, true );
			} else if ( reservedEventNames.test( attribute.f ) ) {
				parser.pos -= attribute.f.length;
				parser.error( 'Cannot use reserved event names (change, reset, teardown, update, construct, config, init, render, unrender, detach, insert)' );
			}
		}

		else {
			parser.allowWhitespace();
			const value = parser.nextChar() === '=' ? readAttributeValue( parser ) : null;
			attribute.f = value != null ? value : attribute.f;

			if ( parser.sanitizeEventAttributes && onPattern.test( attribute.n ) ) {
				return { exclude: true };
			} else {
				attribute.f = attribute.f || ( attribute.f === '' ? '' : 0 );
				attribute.t = ATTRIBUTE;
			}
		}

		return attribute;
}

function readProxyEvent ( parser, attribute ) {
	const start = parser.pos;
	if ( !parser.matchString( '=' ) ) parser.error( `Missing required directive arguments` );

	const quote = parser.matchString( `'` ) || parser.matchString( `"` );
	parser.allowWhitespace();
	const proxy = parser.matchPattern( proxyEvent );

	if ( proxy !== undefined ) {
		if ( quote ) {
			parser.allowWhitespace();
			if ( !parser.matchString( quote ) ) parser.pos = start;
			else return ( attribute.f = proxy ) || true;
		} else if ( !parser.matchPattern( whitespace ) ) {
			parser.pos = start;
		} else {
			return ( attribute.f = proxy ) || true;
		}
	} else {
		parser.pos = start;
	}
}

function readArguments ( parser, attribute, required = false ) {
	parser.allowWhitespace();
	if ( !parser.matchString( "=" ) ) {
		if ( required ) parser.error( `Missing required directive arguments` );
		return;
	}
	parser.allowWhitespace();

	const quote = parser.matchString( "\"" ) || parser.matchString( "'" );
	const spread = parser.spreadArgs;
	parser.spreadArgs = true;
	const exprs = readExpressionList( parser );
	parser.spreadArgs = spread;

	if ( quote ) {
		parser.allowWhitespace();
		if ( parser.matchString( quote ) !== quote ) parser.error( `Expected matching quote '${quote}'` );
	}

	attribute.f = flattenExpression({ m: exprs, t: 22 });
}
