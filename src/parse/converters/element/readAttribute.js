import { ATTRIBUTE, DECORATOR, BINDING_FLAG, TRANSITION, EVENT } from '../../../config/types';
import getLowestIndex from '../utils/getLowestIndex';
import readMustache from '../readMustache';
import { decodeCharacterReferences } from '../../../utils/html';
import processDirective from './processDirective';
import { warnOnceIfDebug } from '../../../utils/log';

var attributeNamePattern = /^[^\s"'>\/=]+/,
	onPattern = /^on/,
	proxyEventPattern = /^on-([a-zA-Z\\*\\.$_][a-zA-Z\\*\\.$_0-9\-]+)$/,
	reservedEventNames = /^(?:change|reset|teardown|update|construct|config|init|render|unrender|detach|insert)$/,
	decoratorPattern = /^as-([a-z-A-Z][-a-zA-Z_0-9]*)$/,
	transitionPattern = /^([a-zA-Z](?:(?!-in-out)[-a-zA-Z_0-9])*)-(in|out|in-out)$/,
	directives = {
				   'intro-outro': { t: TRANSITION, v: 't0' },
				   intro: { t: TRANSITION, v: 't1' },
				   outro: { t: TRANSITION, v: 't2' },
				   lazy: { t: BINDING_FLAG, v: 'l' },
				   twoway: { t: BINDING_FLAG, v: 't' },
				   decorator: { t: DECORATOR }
				 },
	unquotedAttributeValueTextPattern = /^[^\s"'=<>`]+/;

export default function readAttribute ( parser ) {
	var attr, name, value, i, nearest, idx;

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

	attr = { n: name };

	value = readAttributeValue( parser );
	if ( value != null ) { // not null/undefined
		attr.f = value;
	}

	return attr;
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

		attribute = readAttribute( parser );

		if ( !attribute ) return null;

		// intro, outro, decorator
		if ( directive = directives[ attribute.n ] ) {
			attribute.t = directive.t;
			if ( directive.v ) attribute.v = directive.v;
			delete attribute.n; // no name necessary

			if ( directive.t === TRANSITION || directive.t === DECORATOR ) attribute.f = processDirective( attribute.f, parser );

			if ( directive.t === TRANSITION ) {
				warnOnceIfDebug( `${ directive.v === 't0' ? 'intro-outro' : directive.v === 't1' ? 'intro' : 'outro' } is deprecated. To specify tranisitions, use the transition name suffixed with '-in', '-out', or '-in-out' as an attribute. Arguments can be specified in the attribute value as a simple list of expressions without mustaches.` );
			} else if ( directive.t === DECORATOR ) {
				warnOnceIfDebug( `decorator is deprecated. To specify decorators, use the decorator name prefixed with 'as-' as an attribute. Arguments can be specified in the attribute value as a simple list of expressions without mustaches.` );
			}
		}

		// decorators
		else if ( match = decoratorPattern.exec( attribute.n ) ) {
			delete attribute.n;
			attribute.t = DECORATOR;
			attribute.f = processDirective( attribute.f, parser, DECORATOR );
			if ( typeof attribute.f === 'object' ) attribute.f.n = match[1];
			else attribute.f = match[1];
		}

		// transitions
		else if ( match = transitionPattern.exec( attribute.n ) ) {
			delete attribute.n;
			attribute.t = TRANSITION;
			attribute.f = processDirective( attribute.f, parser, TRANSITION );
			if ( typeof attribute.f === 'object' ) attribute.f.n = match[1];
			else attribute.f = match[1];
			attribute.v = match[2] === 'in-out' ? 't0' : match[2] === 'in' ? 't1' : 't2';
		}

		// on-click etc
		else if ( match = proxyEventPattern.exec( attribute.n ) ) {
			attribute.n = match[1];
			attribute.t = EVENT;
			attribute.f = processDirective( attribute.f, parser );

			if ( reservedEventNames.test( attribute.f.n || attribute.f ) ) {
				parser.pos -= ( attribute.f.n || attribute.f ).length;
				parser.error( 'Cannot use reserved event names (change, reset, teardown, update, construct, config, init, render, unrender, detach, insert)' );
			}
		}

		else {
			if ( parser.sanitizeEventAttributes && onPattern.test( attribute.n ) ) {
				return { exclude: true };
			} else {
				attribute.f = attribute.f || ( attribute.f === '' ? '' : 0 );
				attribute.t = ATTRIBUTE;
			}
		}

		return attribute;
}
