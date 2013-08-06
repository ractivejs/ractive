(function () {

	var getItem,
	getText,
	getMustache,
	getElement,

	Fragment,
	Text,
	Mustache,
	Section,
	Element,
	Expression,

	stringify,
	jsonify;


	getFragmentStubFromTokens = function ( tokens, options, preserveWhitespace ) {
		var parser, stub;

		parser = {
			pos: 0,
			tokens: tokens || [],
			next: function () {
				return parser.tokens[ parser.pos ];
			},
			options: options
		};

		stub = new Fragment( parser, preserveWhitespace );

		return stub;
	};

	getItem = function ( parser, preserveWhitespace ) {
		if ( !parser.next() ) {
			return null;
		}

		return getText( parser, preserveWhitespace )
		    || getMustache( parser, preserveWhitespace )
		    || getElement( parser, preserveWhitespace );
	};

	getText = function ( parser, preserveWhitespace ) {
		var next = parser.next();

		if ( next.type === TEXT ) {
			parser.pos += 1;
			return new Text( next, preserveWhitespace );
		}

		return null;
	};

	getMustache = function ( parser, preserveWhitespace ) {
		var next = parser.next();

		if ( next.type === MUSTACHE || next.type === TRIPLE ) {
			if ( next.mustacheType === SECTION || next.mustacheType === INVERTED ) {
				return new Section( next, parser, preserveWhitespace );				
			}

			return new Mustache( next, parser );
		}

		return null;
	};

	getElement = function ( parser, preserveWhitespace ) {
		var next = parser.next(), stub;

		if ( next.type === TAG ) {
			stub = new Element( next, parser, preserveWhitespace );

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

	stringify = function ( items ) {
		var str = '', itemStr, i, len;

		if ( !items ) {
			return '';
		}

		for ( i=0, len=items.length; i<len; i+=1 ) {
			itemStr = items[i].toString();
			
			if ( itemStr === false ) {
				return false;
			}

			str += itemStr;
		}

		return str;
	};

	jsonify = function ( items, noStringify ) {
		var str, json;

		if ( !noStringify ) {
			str = stringify( items );
			if ( str !== false ) {
				return str;
			}
		}

		json = items.map( function ( item ) {
			return item.toJson( noStringify );
		});

		return json;
	};



	Fragment = function ( parser, preserveWhitespace ) {
		var items, item;

		items = this.items = [];

		item = getItem( parser, preserveWhitespace );
		while ( item !== null ) {
			items[ items.length ] = item;
			item = getItem( parser, preserveWhitespace );
		}
	};

	Fragment.prototype = {
		toJson: function ( noStringify ) {
			var json = jsonify( this.items, noStringify );
			return json;
		},

		toString: function () {
			var str = stringify( this.items );
			return str;
		}
	};


	// text
	(function () {
		var htmlEntities, decodeCharacterReferences, whitespace;

		Text = function ( token, preserveWhitespace ) {
			this.type = TEXT;
			this.text = ( preserveWhitespace ? token.value : token.value.replace( whitespace, ' ' ) );
		};

		Text.prototype = {
			toJson: function () {
				// this will be used as text, so we need to decode things like &amp;
				return this.decoded || ( this.decoded = decodeCharacterReferences( this.text) );
			},

			toString: function () {
				// this will be used as straight text
				return this.text;
			}
		};

		htmlEntities = { quot: 34, amp: 38, apos: 39, lt: 60, gt: 62, nbsp: 160, iexcl: 161, cent: 162, pound: 163, curren: 164, yen: 165, brvbar: 166, sect: 167, uml: 168, copy: 169, ordf: 170, laquo: 171, not: 172, shy: 173, reg: 174, macr: 175, deg: 176, plusmn: 177, sup2: 178, sup3: 179, acute: 180, micro: 181, para: 182, middot: 183, cedil: 184, sup1: 185, ordm: 186, raquo: 187, frac14: 188, frac12: 189, frac34: 190, iquest: 191, Agrave: 192, Aacute: 193, Acirc: 194, Atilde: 195, Auml: 196, Aring: 197, AElig: 198, Ccedil: 199, Egrave: 200, Eacute: 201, Ecirc: 202, Euml: 203, Igrave: 204, Iacute: 205, Icirc: 206, Iuml: 207, ETH: 208, Ntilde: 209, Ograve: 210, Oacute: 211, Ocirc: 212, Otilde: 213, Ouml: 214, times: 215, Oslash: 216, Ugrave: 217, Uacute: 218, Ucirc: 219, Uuml: 220, Yacute: 221, THORN: 222, szlig: 223, agrave: 224, aacute: 225, acirc: 226, atilde: 227, auml: 228, aring: 229, aelig: 230, ccedil: 231, egrave: 232, eacute: 233, ecirc: 234, euml: 235, igrave: 236, iacute: 237, icirc: 238, iuml: 239, eth: 240, ntilde: 241, ograve: 242, oacute: 243, ocirc: 244, otilde: 245, ouml: 246, divide: 247, oslash: 248, ugrave: 249, uacute: 250, ucirc: 251, uuml: 252, yacute: 253, thorn: 254, yuml: 255, OElig: 338, oelig: 339, Scaron: 352, scaron: 353, Yuml: 376, fnof: 402, circ: 710, tilde: 732, Alpha: 913, Beta: 914, Gamma: 915, Delta: 916, Epsilon: 917, Zeta: 918, Eta: 919, Theta: 920, Iota: 921, Kappa: 922, Lambda: 923, Mu: 924, Nu: 925, Xi: 926, Omicron: 927, Pi: 928, Rho: 929, Sigma: 931, Tau: 932, Upsilon: 933, Phi: 934, Chi: 935, Psi: 936, Omega: 937, alpha: 945, beta: 946, gamma: 947, delta: 948, epsilon: 949, zeta: 950, eta: 951, theta: 952, iota: 953, kappa: 954, lambda: 955, mu: 956, nu: 957, xi: 958, omicron: 959, pi: 960, rho: 961, sigmaf: 962, sigma: 963, tau: 964, upsilon: 965, phi: 966, chi: 967, psi: 968, omega: 969, thetasym: 977, upsih: 978, piv: 982, ensp: 8194, emsp: 8195, thinsp: 8201, zwnj: 8204, zwj: 8205, lrm: 8206, rlm: 8207, ndash: 8211, mdash: 8212, lsquo: 8216, rsquo: 8217, sbquo: 8218, ldquo: 8220, rdquo: 8221, bdquo: 8222, dagger: 8224, Dagger: 8225, bull: 8226, hellip: 8230, permil: 8240, prime: 8242, Prime: 8243, lsaquo: 8249, rsaquo: 8250, oline: 8254, frasl: 8260, euro: 8364, image: 8465, weierp: 8472, real: 8476, trade: 8482, alefsym: 8501, larr: 8592, uarr: 8593, rarr: 8594, darr: 8595, harr: 8596, crarr: 8629, lArr: 8656, uArr: 8657, rArr: 8658, dArr: 8659, hArr: 8660, forall: 8704, part: 8706, exist: 8707, empty: 8709, nabla: 8711, isin: 8712, notin: 8713, ni: 8715, prod: 8719, sum: 8721, minus: 8722, lowast: 8727, radic: 8730, prop: 8733, infin: 8734, ang: 8736, and: 8743, or: 8744, cap: 8745, cup: 8746, 'int': 8747, there4: 8756, sim: 8764, cong: 8773, asymp: 8776, ne: 8800, equiv: 8801, le: 8804, ge: 8805, sub: 8834, sup: 8835, nsub: 8836, sube: 8838, supe: 8839, oplus: 8853, otimes: 8855, perp: 8869, sdot: 8901, lceil: 8968, rceil: 8969, lfloor: 8970, rfloor: 8971, lang: 9001, rang: 9002, loz: 9674, spades: 9824, clubs: 9827, hearts: 9829, diams: 9830	};

		decodeCharacterReferences = function ( html ) {
			var result;

			// named entities
			result = html.replace( /&([a-zA-Z]+);/, function ( match, name ) {
				if ( htmlEntities[ name ] ) {
					return String.fromCharCode( htmlEntities[ name ] );
				}

				return match;
			});

			// hex references
			result = result.replace( /&#x([0-9]+);/, function ( match, hex ) {
				return String.fromCharCode( parseInt( hex, 16 ) );
			});

			// decimal references
			result = result.replace( /&#([0-9]+);/, function ( match, num ) {
				return String.fromCharCode( num );
			});

			return result;
		};

		whitespace = /\s+/g;
	}());


	// mustache
	(function () {
		Mustache = function ( token, parser ) {
			this.type = ( token.type === TRIPLE ? TRIPLE : token.mustacheType );

			if ( token.ref ) {
				this.ref = token.ref;
			}
			
			if ( token.expression ) {
				this.expr = new Expression( token.expression );
			}

			parser.pos += 1;
		};

		Mustache.prototype = {
			toJson: function () {
				var json;

				if ( this.json ) {
					return this.json;
				}

				json = {
					t: this.type
				};

				if ( this.ref ) {
					json.r = this.ref;
				}

				if ( this.expr ) {
					json.x = this.expr.toJson();
				}

				this.json = json;
				return json;
			},

			toString: function () {
				// mustaches cannot be stringified
				return false;
			}
		};


		Section = function ( firstToken, parser, preserveWhitespace ) {
			var next;

			this.ref = firstToken.ref;
			this.indexRef = firstToken.indexRef;

			this.inverted = ( firstToken.mustacheType === INVERTED );

			if ( firstToken.expression ) {
				this.expr = new Expression( firstToken.expression );
			}

			parser.pos += 1;

			this.items = [];
			next = parser.next();

			while ( next ) {
				if ( next.mustacheType === CLOSING ) {
					if ( ( next.ref.trim() === this.ref ) || this.expr ) {
						parser.pos += 1;
						break;
					}

					else {
						throw new Error( 'Could not parse template: Illegal closing section' );
					}
				}

				this.items[ this.items.length ] = getItem( parser, preserveWhitespace );
				next = parser.next();
			}
		};

		Section.prototype = {
			toJson: function ( noStringify ) {
				var json, str, i, len, itemStr;

				if ( this.json ) {
					return this.json;
				}

				json = { t: SECTION };

				if ( this.ref ) {
					json.r = this.ref;
				}

				if ( this.indexRef ) {
					json.i = this.indexRef;
				}

				if ( this.inverted ) {
					json.n = true;
				}

				if ( this.expr ) {
					json.x = this.expr.toJson();
				}

				if ( this.items.length ) {
					json.f = jsonify( this.items, noStringify );
				}

				this.json = json;
				return json;
			},

			toString: function () {
				// sections cannot be stringified
				return false;
			}
		};
	}());


	// element
	(function () {
		var voidElementNames,
			allElementNames,
			mapToLowerCase,
			svgCamelCaseElements,
			svgCamelCaseElementsMap,
			svgCamelCaseAttributes,
			svgCamelCaseAttributesMap,
			closedByParentClose,
			siblingsByTagName,
			onPattern,
			sanitize,
			filterAttrs;

		Element = function ( firstToken, parser, preserveWhitespace ) {
			var closed, next, i, len, attrs, filtered, proxies, attr, getFrag, processProxy, item;

			this.lcTag = firstToken.name.toLowerCase();

			// enforce lower case tag names by default. HTML doesn't care. SVG does, so if we see an SVG tag
			// that should be camelcased, camelcase it
			this.tag = ( svgCamelCaseElementsMap[ this.lcTag ] ? svgCamelCaseElementsMap[ this.lcTag ] : this.lcTag );

			parser.pos += 1;

			// if this is a <pre> element, preserve whitespace within
			preserveWhitespace = ( preserveWhitespace || this.lcTag === 'pre' );

			if ( firstToken.attrs ) {
				filtered = filterAttrs( firstToken.attrs );
				
				attrs = filtered.attrs;
				proxies = filtered.proxies;

				// remove event attributes (e.g. onclick='doSomething()') if we're sanitizing
				if ( parser.options.sanitize && parser.options.sanitize.eventAttributes ) {
					attrs = attrs.filter( sanitize );
				}

				getFrag = function ( attr ) {
					var lcName = attr.name.toLowerCase();

					return {
						name: ( svgCamelCaseAttributesMap[ lcName ] ? svgCamelCaseAttributesMap[ lcName ] : lcName ),
						value: getFragmentStubFromTokens( attr.value )
					};
				};

				processProxy = function ( proxy ) {
					var processed, domEventName, match, tokens, proxyName, proxyArgs, colonIndex, throwError;

					throwError = function () {
						throw new Error( 'Illegal proxy event' );
					};

					if ( !proxy.name || !proxy.value ) {
						throwError();
					}

					processed = { domEventName: proxy.name };

					tokens = proxy.value;

					// proxy event names must start with a string (no mustaches)
					if ( tokens[0].type !== TEXT ) {
						throwError();
					}

					colonIndex = tokens[0].value.indexOf( ':' );
					
					// if no arguments are specified...
					if ( colonIndex === -1 ) {
						
						// ...the proxy name must be string-only (no mustaches)
						if ( tokens.length > 1 ) {
							throwError();
						}

						processed.name = tokens[0].value;
					}

					else {
						processed.name = tokens[0].value.substr( 0, colonIndex );
						tokens[0].value = tokens[0].value.substring( colonIndex + 1 );

						if ( !tokens[0].value ) {
							tokens.shift();
						}

						// can we parse it yet?
						if ( tokens.length === 1 && tokens[0].type === TEXT ) {
							try {
								processed.args = JSON.parse( tokens[0].value );
							} catch ( err ) {
								processed.args = tokens[0].value;
							}
						}

						processed.dynamicArgs = getFragmentStubFromTokens( tokens );
					}

					return processed;
				};

				if ( attrs.length ) {
					this.attributes = attrs.map( getFrag );
				}

				if ( proxies.length ) {
					this.proxies = proxies.map( processProxy );
				}

				// TODO rename this helper function
				if ( filtered.intro ) {
					this.intro = processProxy( filtered.intro );
				}

				if ( filtered.outro ) {
					this.outro = processProxy( filtered.outro );
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

				// section closing mustache should also close this element, e.g.
				// <ul>{{#items}}<li>{{content}}{{/items}}</ul>
				if ( next.mustacheType === CLOSING ) {
					break;
				}
				
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

				this.items[ this.items.length ] = getItem( parser );

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

		Element.prototype = {
			toJson: function ( noStringify ) {
				var json, name, value, str, itemStr, proxy, match, i, len;

				json = {
					t: ELEMENT,
					e: this.tag
				};

				if ( this.attributes && this.attributes.length ) {
					json.a = {};

					len = this.attributes.length;
					for ( i=0; i<len; i+=1 ) {
						name = this.attributes[i].name;

						if ( json.a[ name ] ) {
							throw new Error( 'You cannot have multiple elements with the same name' );
						}

						// empty attributes (e.g. autoplay, checked)
						if( this.attributes[i].value === undefined ) {
							value = null;
						}

						value = jsonify( this.attributes[i].value.items, noStringify );

						json.a[ name ] = value;
					}
				}

				if ( this.items && this.items.length ) {
					json.f = jsonify( this.items, noStringify );
				}

				if ( this.proxies && this.proxies.length ) {
					json.v = {};

					len = this.proxies.length;
					for ( i=0; i<len; i+=1 ) {
						proxy = this.proxies[i];

						// TODO rename domEventName, since transitions use the same mechanism
						if ( proxy.args ) {
							json.v[ proxy.domEventName ] = {
								n: proxy.name,
								a: proxy.args
							};
						} else if ( proxy.dynamicArgs ) {
							json.v[ proxy.domEventName ] = {
								n: proxy.name,
								d: jsonify( proxy.dynamicArgs.items, noStringify )
							};
						} else {
							json.v[ proxy.domEventName ] = proxy.name;
						}
					}
				}

				if ( this.intro ) {
					if ( this.intro.args ) {
						json.t1 = {
							n: this.intro.name,
							a: this.intro.args
						};
					} else if ( this.intro.dynamicArgs ) {
						json.t1 = {
							n: this.intro.name,
							d: jsonify( this.intro.dynamicArgs.items, noStringify )
						};
					} else {
						json.t1 = this.intro.name;
					}
				}

				if ( this.outro ) {
					if ( this.outro.args ) {
						json.t2 = {
							n: this.outro.name,
							a: this.outro.args
						};
					} else if ( this.outro.dynamicArgs ) {
						json.t2 = {
							n: this.outro.name,
							d: jsonify( this.outro.dynamicArgs.items, noStringify )
						};
					} else {
						json.t2 = this.outro.name;
					}
				}

				this.json = json;
				return json;
			},

			toString: function () {
				var str, i, len, attrStr, lcName, attrValueStr, fragStr, isVoid;

				if ( this.str !== undefined ) {
					return this.str;
				}

				// if this isn't an HTML element, it can't be stringified (since the only reason to stringify an
				// element is to use with innerHTML, and SVG doesn't support that method.
				// Note: table elements and select children are excluded from this, because IE (of course)
				// fucks up when you use innerHTML with them
				if ( allElementNames.indexOf( this.tag.toLowerCase() ) === -1 ) {
					return ( this.str = false );
				}

				// do we have proxies or transitions? if so we can't use innerHTML
				if ( this.proxies || this.intro || this.outro ) {
					return ( this.str = false );
				}

				// see if children can be stringified (i.e. don't contain mustaches)
				fragStr = stringify( this.items );
				if ( fragStr === false ) {
					return ( this.str = false );
				}

				// is this a void element?
				isVoid = ( voidElementNames.indexOf( this.tag.toLowerCase() ) !== -1 );

				str = '<' + this.tag;
				
				if ( this.attributes ) {
					for ( i=0, len=this.attributes.length; i<len; i+=1 ) {

						lcName = this.attributes[i].name.toLowerCase();
						
						// does this look like a namespaced attribute? if so we can't stringify it
						if ( lcName.indexOf( ':' ) !== -1 ) {
							return ( this.str = false );
						}

						// if this element has an id attribute, it can't be stringified (since references are stored
						// in ractive.nodes). Similarly, intro and outro transitions
						if ( lcName === 'id' || lcName === 'intro' || lcName === 'outro' ) {
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


		voidElementNames = 'area base br col command embed hr img input keygen link meta param source track wbr'.split( ' ' );
		allElementNames = 'a abbr acronym address applet area b base basefont bdo big blockquote body br button caption center cite code col colgroup dd del dfn dir div dl dt em fieldset font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex kbd label legend li link map menu meta noframes noscript object ol p param pre q s samp script select small span strike strong style sub sup textarea title tt u ul var article aside audio bdi canvas command data datagrid datalist details embed eventsource figcaption figure footer header hgroup keygen mark meter nav output progress ruby rp rt section source summary time track video wbr'.split( ' ' );
		closedByParentClose = 'li dd rt rp optgroup option tbody tfoot tr td th'.split( ' ' );

		svgCamelCaseElements = 'altGlyph altGlyphDef altGlyphItem animateColor animateMotion animateTransform clipPath feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence foreignObject glyphRef linearGradient radialGradient textPath vkern'.split( ' ' );
		svgCamelCaseAttributes = 'attributeName attributeType baseFrequency baseProfile calcMode clipPathUnits contentScriptType contentStyleType diffuseConstant edgeMode externalResourcesRequired filterRes filterUnits glyphRef glyphRef gradientTransform gradientTransform gradientUnits gradientUnits kernelMatrix kernelUnitLength kernelUnitLength kernelUnitLength keyPoints keySplines keyTimes lengthAdjust limitingConeAngle markerHeight markerUnits markerWidth maskContentUnits maskUnits numOctaves pathLength patternContentUnits patternTransform patternUnits pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits refX refY repeatCount repeatDur requiredExtensions requiredFeatures specularConstant specularExponent specularExponent spreadMethod spreadMethod startOffset stdDeviation stitchTiles surfaceScale surfaceScale systemLanguage tableValues targetX targetY textLength textLength viewBox viewTarget xChannelSelector yChannelSelector zoomAndPan'.split( ' ' );
		
		mapToLowerCase = function ( items ) {
			var map = {}, i = items.length;
			while ( i-- ) {
				map[ items[i].toLowerCase() ] = items[i];
			}
			return map;
		};

		svgCamelCaseElementsMap = mapToLowerCase( svgCamelCaseElements );
		svgCamelCaseAttributesMap = mapToLowerCase( svgCamelCaseAttributes );

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

		onPattern = /^on[a-zA-Z]/;

		sanitize = function ( attr ) {
			var valid = !onPattern.test( attr.name );
			return valid;
		};

		filterAttrs = function ( items ) {
			var attrs, proxies, filtered, i, len, item;

			filtered = {};
			attrs = [];
			proxies = [];

			len = items.length;
			for ( i=0; i<len; i+=1 ) {
				item = items[i];

				// Transition?
				if ( item.name === 'intro' ) {
					if ( filtered.intro ) {
						throw new Error( 'An element can only have one intro transition' );
					}

					filtered.intro = item;
				} else if ( item.name === 'outro' ) {
					if ( filtered.outro ) {
						throw new Error( 'An element can only have one outro transition' );
					}

					filtered.outro = item;
				}

				// Proxy?
				else if ( item.name.substr( 0, 6 ) === 'proxy-' ) {
					item.name = item.name.substring( 6 );
					proxies[ proxies.length ] = item;
				}

				else if ( item.name.substr( 0, 3 ) === 'on-' ) {
					item.name = item.name.substring( 3 );
					proxies[ proxies.length ] = item;
				}

				// Attribute?
				else {
					attrs[ attrs.length ] = item;
				}
			}

			filtered.attrs = attrs;
			filtered.proxies = proxies;

			return filtered;
		};
	}());


	// expression
	(function () {

		var getRefs, stringify, stringifyKey, identifier;

		Expression = function ( token ) {
			this.refs = [];

			getRefs( token, this.refs );
			this.str = stringify( token, this.refs );
		};

		Expression.prototype = {
			toJson: function () {
				return {
					r: this.refs,
					s: this.str
				};
			}
		};


		// TODO maybe refactor this?
		getRefs = function ( token, refs ) {
			var i, list;

			if ( token.t === REFERENCE ) {
				if ( refs.indexOf( token.n ) === -1 ) {
					refs.unshift( token.n );
				}
			}

			list = token.o || token.m;
			if ( list ) {
				if ( isObject( list ) ) {
					getRefs( list, refs );
				} else {
					i = list.length;
					while ( i-- ) {
						getRefs( list[i], refs );
					}
				}
			}

			if ( token.x ) {
				getRefs( token.x, refs );
			}

			if ( token.r ) {
				getRefs( token.r, refs );
			}

			if ( token.v ) {
				getRefs( token.v, refs );
			}
		};


		stringify = function ( token, refs ) {
			var map = function ( item ) {
				return stringify( item, refs );
			};

			switch ( token.t ) {
				case BOOLEAN_LITERAL:
				case GLOBAL:
				case NUMBER_LITERAL:
				return token.v;

				case STRING_LITERAL:
				return "'" + token.v.replace( /'/g, "\\'" ) + "'";

				case ARRAY_LITERAL:
				return '[' + ( token.m ? token.m.map( map ).join( ',' ) : '' ) + ']';

				case OBJECT_LITERAL:
				return '{' + ( token.m ? token.m.map( map ).join( ',' ) : '' ) + '}';

				case KEY_VALUE_PAIR:
				return stringifyKey( token.k ) + ':' + stringify( token.v, refs );

				case PREFIX_OPERATOR:
				return ( token.s === 'typeof' ? 'typeof ' : token.s ) + stringify( token.o, refs );

				case INFIX_OPERATOR:
				return stringify( token.o[0], refs ) + token.s + stringify( token.o[1], refs );

				case INVOCATION:
				return stringify( token.x, refs ) + '(' + ( token.o ? token.o.map( map ).join( ',' ) : '' ) + ')';

				case BRACKETED:
				return '(' + stringify( token.x, refs ) + ')';

				case MEMBER:
				return stringify( token.x, refs ) + stringify( token.r, refs );

				case REFINEMENT:
				return ( token.n ? '.' + token.n : '[' + stringify( token.x, refs ) + ']' );

				case CONDITIONAL:
				return stringify( token.o[0], refs ) + '?' + stringify( token.o[1], refs ) + ':' + stringify( token.o[2], refs );

				case REFERENCE:
				return '${' + refs.indexOf( token.n ) + '}';

				default:
				console.log( token );
				throw new Error( 'Could not stringify expression token. This error is unexpected' );
			}
		};

		stringifyKey = function ( key ) {
			if ( key.t === STRING_LITERAL ) {
				return identifier.test( key.v ) ? key.v : '"' + key.v.replace( /"/g, '\\"' ) + '"';
			}

			if ( key.t === NUMBER_LITERAL ) {
				return key.v;
			}

			return key;
		};

		identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

	}());

}());