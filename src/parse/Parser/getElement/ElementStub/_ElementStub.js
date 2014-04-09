define([
	'config/types',
	'config/voidElementNames',
	'utils/warn',

	'parse/Parser/getElement/ElementStub/utils/siblingsByTagName',
	'parse/Parser/getElement/ElementStub/utils/filterAttributes',
	'parse/Parser/getElement/ElementStub/utils/processDirective',

	'parse/Parser/getElement/ElementStub/toJSON',
	'parse/Parser/getElement/ElementStub/toString',

	'parse/Parser/StringStub/_StringStub'
], function (
	types,
	voidElementNames,
	warn,

	siblingsByTagName,
	filterAttributes,
	processDirective,

	toJSON,
	toString,

	StringStub
) {

	'use strict';

	var ElementStub,

		// helpers
		allElementNames,
		closedByParentClose,
		onPattern,
		sanitize,
		leadingWhitespace = /^\s+/,
		trailingWhitespace = /\s+$/;


	ElementStub = function ( firstToken, parser, preserveWhitespace ) {
		var next, attrs, filtered, proxies, item, getFrag, lowerCaseTag;

		parser.pos += 1;

		getFrag = function ( attr ) {
			return {
				name: attr.name,
				value: attr.value ? new StringStub( attr.value ) : null
			};
		};

		// enforce lower case tag names by default. HTML doesn't care. SVG does, so if we see an SVG tag
		// that should be camelcased, camelcase it
		this.tag = firstToken.name;
		lowerCaseTag = firstToken.name.toLowerCase();

		if ( lowerCaseTag.substr( 0, 3 ) === 'rv-' ) {
			warn( 'The "rv-" prefix for components has been deprecated. Support will be removed in a future version' );
			this.tag = this.tag.substring( 3 );
		}

		// if this is a <pre> element, preserve whitespace within
		preserveWhitespace = ( preserveWhitespace || lowerCaseTag === 'pre' || lowerCaseTag === 'style' || lowerCaseTag === 'script' );

		if ( firstToken.attrs ) {
			filtered = filterAttributes( firstToken.attrs );

			attrs = filtered.attrs;
			proxies = filtered.proxies;

			// remove event attributes (e.g. onclick='doSomething()') if we're sanitizing
			if ( parser.options.sanitize && parser.options.sanitize.eventAttributes ) {
				attrs = attrs.filter( sanitize );
			}

			if ( attrs.length ) {
				this.attributes = attrs.map( getFrag );
			}

			// Process directives (proxy events, transitions, and decorators)
			if ( proxies.length ) {
				this.proxies = proxies.map( processDirective );
			}

			if ( filtered.intro ) {
				this.intro = processDirective( filtered.intro );
			}

			if ( filtered.outro ) {
				this.outro = processDirective( filtered.outro );
			}

			if ( filtered.decorator ) {
				this.decorator = processDirective( filtered.decorator );
			}
		}

		if ( firstToken.doctype ) {
			this.doctype = true;
		}

		if ( firstToken.selfClosing ) {
			this.selfClosing = true;
		}

		if ( voidElementNames.indexOf( lowerCaseTag ) !== -1 ) {
			this.isVoid = true;
		}

		// if self-closing or a void element, close
		if ( this.selfClosing || this.isVoid ) {
			return;
		}

		this.siblings = siblingsByTagName[ lowerCaseTag ];

		this.items = [];

		next = parser.next();
		while ( next ) {

			// section closing mustache should also close this element, e.g.
			// <ul>{{#items}}<li>{{content}}{{/items}}</ul>
			if ( next.mustacheType === types.CLOSING ) {
				break;
			}

			if ( next.type === types.TAG ) {

				// closing tag
				if ( next.closing ) {
					// it's a closing tag, which means this element is closed...
					if ( next.name.toLowerCase() === lowerCaseTag ) {
						parser.pos += 1;
					}

					break;
				}

				// sibling element, which closes this element implicitly
				else if ( this.siblings && ( this.siblings.indexOf( next.name.toLowerCase() ) !== -1 ) ) {
					break;
				}

			}

			this.items.push( parser.getStub( preserveWhitespace ) );

			next = parser.next();
		}


		// if we're not preserving whitespace, we can eliminate inner leading and trailing whitespace
		if ( !preserveWhitespace ) {
			item = this.items[0];
			if ( item && item.type === types.TEXT ) {
				item.text = item.text.replace( leadingWhitespace, '' );
				if ( !item.text ) {
					this.items.shift();
				}
			}

			item = this.items[ this.items.length - 1 ];
			if ( item && item.type === types.TEXT ) {
				item.text = item.text.replace( trailingWhitespace, '' );
				if ( !item.text ) {
					this.items.pop();
				}
			}
		}
	};

	ElementStub.prototype = {
		toJSON: toJSON,
		toString: toString
	};


	allElementNames = 'a abbr acronym address applet area b base basefont bdo big blockquote body br button caption center cite code col colgroup dd del dfn dir div dl dt em fieldset font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex kbd label legend li link map menu meta noframes noscript object ol p param pre q s samp script select small span strike strong style sub sup textarea title tt u ul var article aside audio bdi canvas command data datagrid datalist details embed eventsource figcaption figure footer header hgroup keygen mark meter nav output progress ruby rp rt section source summary time track video wbr'.split( ' ' );
	closedByParentClose = 'li dd rt rp optgroup option tbody tfoot tr td th'.split( ' ' );

	onPattern = /^on[a-zA-Z]/;

	sanitize = function ( attr ) {
		var valid = !onPattern.test( attr.name );
		return valid;
	};

	return ElementStub;

});
