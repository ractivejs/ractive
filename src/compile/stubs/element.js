(function ( stubs ) {

	var ElementStub, voidElementNames, allElementNames, closedByParentClose, siblingsByTagName, sanitize, onlyAttrs, onlyProxies, leadingWhitespace, trailingWhitespace;

	stubs.element = function ( parser, priority, preserveWhitespace ) {
		var next = parser.next(), stub;

		if ( next.type === TAG ) {
			stub = new ElementStub( next, parser, priority, preserveWhitespace );

			// sanitize			
			if ( parser.options.sanitize && parser.options.sanitize.elements ) {
				if ( parser.options.sanitize.elements.indexOf( stub.lcTag ) !== -1 ) {
					return null;
				}
			}

			return stub;
		}

		return null;
	};



	voidElementNames = 'area base br col command embed hr img input keygen link meta param source track wbr'.split( ' ' );
	allElementNames = 'a abbr acronym address applet area b base basefont bdo big blockquote body br button caption center cite code col colgroup dd del dfn dir div dl dt em fieldset font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex kbd label legend li link map menu meta noframes noscript object ol optgroup option p param pre q s samp script select small span strike strong style sub sup table tbody td textarea tfoot th thead title tr tt u ul var article aside audio bdi canvas command data datagrid datalist details embed eventsource figcaption figure footer header hgroup keygen mark meter nav output progress ruby rp rt section source summary time track video wbr'.split( ' ' );
	closedByParentClose = 'li dd rt rp optgroup option tbody tfoot tr td th'.split( ' ' );

	siblingsByTagName = {
		li: [ 'li' ],
		dt: [ 'dt', 'dd' ],
		dd: [ 'dt', 'dd' ],
		p: 'address article aside blockquote dir div dl fieldset footer form h1 h2 h3 h4 h5 h6 header hgroup hr menu nav ol p pre section table ul'.split( ' ' ),
		rt: [ 'rt', 'rp' ],
		rp: [ 'rp', 'rt' ],
		optgroup: [ 'optgroup' ],
		option: [ 'option', 'optgroup' ],
		thead: [ 'tbody', 'tfoot' ],
		tbody: [ 'tbody', 'tfoot' ],
		tr: [ 'tr' ],
		td: [ 'td', 'th' ],
		th: [ 'td', 'th' ]
	};

	sanitize = function ( attr ) {
		return attr.name.substr( 0, 2 ) !== 'on';
	};

	onlyAttrs = function ( attr ) {
		return attr.name.substr( 0, 6 ) !== 'proxy-';
	};

	onlyProxies = function ( attr ) {
		if ( attr.name.substr( 0, 6 ) === 'proxy-' ) {
			attr.name = attr.name.substring( 6 );
			return true;
		}
		return false;
	};

	leadingWhitespace = /^\s+/;
	trailingWhitespace = /\s+$/;



	ElementStub = function ( firstToken, parser, priority, preserveWhitespace ) {
		var closed, next, i, len, attrs, proxies, attr, priority, getFrag, item;

		this.tag = firstToken.name;
		this.lcTag = this.tag.toLowerCase();
		this.priority = priority = priority || 0;

		parser.pos += 1;

		// if this is a <pre> element, preserve whitespace within
		preserveWhitespace = ( preserveWhitespace || this.lcTag === 'pre' );

		// TODO proxy events
		if ( firstToken.attrs ) {
			attrs = firstToken.attrs.filter( onlyAttrs );
			proxies = firstToken.attrs.filter( onlyProxies );

			// remove event attributes (e.g. onclick='doSomething()') if we're sanitizing
			if ( parser.options.sanitize && parser.options.sanitize.eventAttributes ) {
				attrs = attrs.filter( sanitize );
			}

			getFrag = function ( attr ) {
				return {
					name: attr.name,
					value: utils.getFragmentStubFromTokens( attr.value, priority + 1 )
				};
			};

			if ( attrs.length ) {
				this.attributes = attrs.map( getFrag );
			}

			if ( proxies.length ) {
				this.proxies = proxies.map( getFrag );
			}
		}

		if ( firstToken.selfClosing ) {
			this.selfClosing = true;
		}

		if ( voidElementNames.indexOf( this.lcTag ) !== -1 ) {
			this.isVoid = true;
		}

		// if self-closing or a void element, close
		if ( this.selfClosing || this.isVoid ) {
			return;
		}

		this.siblings = siblingsByTagName[ this.lcTag ];

		this.items = [];

		next = parser.next();
		while ( next ) {
			
			if ( next.type === TAG ) {

				// closing tag
				if ( next.closing ) {
					// it's a closing tag, which means this element is closed...
					if ( next.name.toLowerCase() === this.lcTag ) {
						parser.pos += 1;
					}

					break;
				}

				// sibling element, which closes this element implicitly
				else if ( this.siblings && ( this.siblings.indexOf( next.name.toLowerCase() ) !== -1 ) ) {
					break;
				}
				
			}

			this.items[ this.items.length ] = stubs.item( parser, this.priority + 1 );

			next = parser.next();
		}


		// if we're not preserving whitespace, we can eliminate inner leading and trailing whitespace
		if ( !preserveWhitespace ) {
			item = this.items[0];
			if ( item && item.type === TEXT ) {
				item.text = item.text.replace( leadingWhitespace, '' );
				if ( !item.text ) {
					this.items.shift();
				}
			}

			item = this.items[ this.items.length - 1 ];
			if ( item && item.type === TEXT ) {
				item.text = item.text.replace( trailingWhitespace, '' );
				if ( !item.text ) {
					this.items.pop();
				}
			}
		}
	};

	ElementStub.prototype = {
		toJson: function ( noStringify ) {
			var json, name, value, str, itemStr, proxy, i, len;

			json = {
				t: ELEMENT,
				e: this.tag
			};

			if ( this.attributes && this.attributes.length ) {
				json.a = {};

				len = this.attributes.length;
				for ( i=0; i<len; i+=1 ) {
					name = this.attributes[i].name;

					// empty attributes (e.g. autoplay, checked)
					if( this.attributes[i].value === undefined ) {
						value = null;
					}

					value = stubUtils.jsonify( this.attributes[i].value.items, noStringify );

					json.a[ name ] = value;
				}
			}

			if ( this.items && this.items.length ) {
				json.f = stubUtils.jsonify( this.items, noStringify );
			}

			if ( this.proxies && this.proxies.length ) {
				json.v = {};

				len = this.proxies.length;
				for ( i=0; i<len; i+=1 ) {
					name = this.proxies[i].name;
					value = stubUtils.jsonify( this.proxies[i].value.items, noStringify );

					json.v[ name ] = value;
				}
			}

			this.json = json;
			return json;
		},

		toString: function () {
			var str, i, len, attrStr, attrValueStr, fragStr, isVoid;

			if ( this.str !== undefined ) {
				return this.str;
			}

			// if this isn't an HTML element, it can't be stringified (since the only reason to stringify an
			// element is to use with innerHTML, and SVG doesn't support that method
			if ( allElementNames.indexOf( this.tag.toLowerCase() ) === -1 ) {
				return ( this.str = false );
			}

			// see if children can be stringified (i.e. don't contain mustaches)
			fragStr = stubUtils.stringify( this.items );
			if ( fragStr === false ) {
				return ( this.str = false );
			}

			// do we have proxies? if so we can't use innerHTML
			if ( this.proxies ) {
				return ( this.str = false );
			}

			// is this a void element?
			isVoid = ( voidElementNames.indexOf( this.tag.toLowerCase() ) !== -1 );

			str = '<' + this.tag;
			
			if ( this.attributes ) {
				for ( i=0, len=this.attributes.length; i<len; i+=1 ) {
					
					// does this look like a namespaced attribute? if so we can't stringify it
					if ( this.attributes[i].name.indexOf( ':' ) !== -1 ) {
						return ( this.str = false );
					}

					attrStr = ' ' + this.attributes[i].name;

					// empty attributes
					if ( this.attributes[i].value !== undefined ) {
						attrValueStr = this.attributes[i].value.toString();

						if ( attrValueStr === false ) {
							return ( this.str = false );
						}

						if ( attrValueStr !== '' ) {
							attrStr += '=';

							// does it need to be quoted?
							if ( /[\s"'=<>`]/.test( attrValueStr ) ) {
								attrStr += '"' + attrValueStr.replace( /"/g, '&quot;' ) + '"';
							} else {
								attrStr += attrValueStr;
							}
						}
					}

					str += attrStr;
				}
			}

			// if this isn't a void tag, but is self-closing, add a solidus. Aaaaand, we're done
			if ( this.selfClosing && !isVoid ) {
				str += '/>';
				return ( this.str = str );
			}

			str += '>';

			// void element? we're done
			if ( isVoid ) {
				return ( this.str = str );
			}

			// if this has children, add them
			str += fragStr;

			str += '</' + this.tag + '>';
			return ( this.str = str );
		}
	};

}( stubs ));