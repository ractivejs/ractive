define([
	'config/types',
	'config/voidElementNames',
	'parse/Parser/getElement/utils/filterAttributes',
	'parse/Parser/getElement/utils/processDirective',
	'parse/Parser/getElement/utils/jsonifyDirective',
	'parse/Parser/getElement/utils/getAttributeStubs',
	'parse/Parser/getElement/utils/siblingsByTagName'
], function (
	types,
	voidElementNames,
	filterAttributes,
	processDirective,
	jsonifyDirective,
	getAttributeStubs,
	siblingsByTagName
) {

	'use strict';

	var leadingWhitespace = /^\s+/,
		trailingWhitespace = /\s+$/,
		onPattern = /^on[a-zA-Z]/;

	return function ( token, preserveWhitespace ) {
		var stub, lowerCaseTag, filtered, attrs, proxies, siblings, fragment, nextToken, item;

		// Not a tag?
		if ( token.type !== types.TAG ) {
			return null;
		}

		// Sanitize
		if ( this.options.sanitize && this.options.sanitize.elements ) {
			if ( this.options.sanitize.elements.indexOf( token.name.toLowerCase() ) !== -1 ) {
				return null;
			}
		}

		this.pos += 1;

		stub = {
			t: types.ELEMENT,
			e: token.name
		};

		lowerCaseTag = stub.e.toLowerCase();

		// if this is a <pre>/<style>/<script> element, preserve whitespace within
		preserveWhitespace = ( preserveWhitespace || lowerCaseTag === 'pre' || lowerCaseTag === 'style' || lowerCaseTag === 'script' );

		if ( token.attrs ) {
			filtered = filterAttributes( token.attrs );

			attrs = filtered.attrs;
			proxies = filtered.proxies;

			// remove event attributes (e.g. onclick='doSomething()') if we're sanitizing
			if ( this.options.sanitize && this.options.sanitize.eventAttributes ) {
				attrs = attrs.filter( sanitize );
			}

			if ( attrs.length ) {
				stub.a = getAttributeStubs( attrs );
			}

			// Process directives (proxy events, transitions, and decorators)
			if ( proxies.length ) {
				stub.v = {};

				proxies.map( processDirective ).forEach( function ( directive ) {
					stub.v[ directive.directiveType ] = jsonifyDirective( directive );
				});
			}

			if ( filtered.intro ) {
				stub.t1 = jsonifyDirective( processDirective( filtered.intro ) );
			}

			if ( filtered.outro ) {
				stub.t2 = jsonifyDirective( processDirective( filtered.outro ) );
			}

			if ( filtered.decorator ) {
				stub.o = jsonifyDirective( processDirective( filtered.decorator ) );
			}
		}

		if ( token.doctype ) {
			stub.y = 1;
		}

		// if self-closing or a void element, close
		if ( token.selfClosing || voidElementNames.indexOf( lowerCaseTag ) !== -1 ) {
			return stub;
		}

		siblings = siblingsByTagName[ lowerCaseTag ];
		fragment = [];

		nextToken = this.next();
		while ( nextToken ) {

			// section closing mustache should also close this element, e.g.
			// <ul>{{#items}}<li>{{content}}{{/items}}</ul>
			if ( nextToken.mustacheType === types.CLOSING ) {
				break;
			}

			if ( nextToken.type === types.TAG ) {

				// closing tag
				if ( nextToken.closing ) {
					// it's a closing tag, which means this element is closed...
					if ( nextToken.name.toLowerCase() === lowerCaseTag ) {
						this.pos += 1;
					}

					break;
				}

				// sibling element, which closes this element implicitly
				else if ( siblings && ( siblings.indexOf( nextToken.name.toLowerCase() ) !== -1 ) ) {
					break;
				}

			}

			fragment.push( this.getStub( preserveWhitespace ) );

			nextToken = this.next();
		}

		if ( fragment.length ) {
			stub.f = fragment;
		}


		// if we're not preserving whitespace, we can eliminate inner leading and trailing whitespace
		// TODO tidy this up
		if ( !preserveWhitespace && stub.f ) {
			if ( typeof stub.f === 'string' ) {
				stub.f = stub.f.trim();
			}

			else {
				item = stub.f[0];
				if ( typeof item === 'string' ) {
					stub.f[0] = item.replace( leadingWhitespace, '' );
					if ( !stub.f[0] ) {
						stub.f.shift();
					}
				}

				item = stub.f[ stub.f.length - 1 ];
				if ( typeof item === 'string' ) {
					stub.f[ stub.f.length - 1 ] = item.replace( trailingWhitespace, '' );
					if ( !stub.f[ stub.f.length - 1 ] ) {
						stub.f.pop();
					}
				}
			}
		}

		return stub;
	};

	function sanitize ( attr ) {
		var valid = !onPattern.test( attr.name );
		return valid;
	}

});
