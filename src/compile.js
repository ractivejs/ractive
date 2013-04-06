var Ractive = Ractive || {}, _private = _private || {}; // in case we're not using the runtime

(function ( R, _private ) {

	'use strict';

	var FragmentStub,
		getFragmentStubFromTokens,
		TextStub,
		ElementStub,
		SectionStub,
		MustacheStub,

		decodeCharacterReferences,
		htmlEntities,

		getFormatter,

		types,

		voidElementNames,
		allElementNames,
		closedByParentClose,
		implicitClosersByTagName;


	R.compile = function ( template, options ) {
		var tokens, fragmentStub, json;

		options = options || {};

		// If delimiters are specified use them, otherwise reset to defaults
		R.delimiters = options.delimiters || [ '{{', '}}' ];
		R.tripleDelimiters = options.tripleDelimiters || [ '{{{', '}}}' ];

		tokens = _private.tokenize( template );
		fragmentStub = getFragmentStubFromTokens( tokens, 0, options.preserveWhitespace );
		
		// TEMP
		json = fragmentStub.toJson();
		
		return fragmentStub.toJson();
	};


	types = _private.types;

	voidElementNames = [ 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr' ];

	allElementNames = [ 'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'b', 'base', 'basefont', 'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'dd', 'del', 'dfn', 'dir', 'div', 'dl', 'dt', 'em', 'fieldset', 'font', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'isindex', 'kbd', 'label', 'legend', 'li', 'link', 'map', 'menu', 'meta', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'p', 'param', 'pre', 'q', 's', 'samp', 'script', 'select', 'small', 'span', 'strike', 'strong', 'style', 'sub', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'tt', 'u', 'ul', 'var', 'article', 'aside', 'audio', 'bdi', 'canvas', 'command', 'data', 'datagrid', 'datalist', 'details', 'embed', 'eventsource', 'figcaption', 'figure', 'footer', 'header', 'hgroup', 'keygen', 'mark', 'meter', 'nav', 'output', 'progress', 'ruby', 'rp', 'rt', 'section', 'source', 'summary', 'time', 'track', 'video', 'wbr' ];

	closedByParentClose = [ 'li', 'dd', 'rt', 'rp', 'optgroup', 'option', 'tbody', 'tfoot', 'tr', 'td', 'th' ];

	implicitClosersByTagName = {
		li: [ 'li' ],
		dt: [ 'dt', 'dd' ],
		dd: [ 'dt', 'dd' ],
		p: [ 'address', 'article', 'aside', 'blockquote', 'dir', 'div', 'dl', 'fieldset', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul' ],
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

	getFormatter = function ( str ) {
		var name, argsStr, args, openIndex;

		openIndex = str.indexOf( '[' );
		if ( openIndex !== -1 ) {
			name = str.substr( 0, openIndex );
			argsStr = str.substring( openIndex, str.length );

			try {
				args = JSON.parse( argsStr );
			} catch ( err ) {
				throw 'Could not parse arguments (' + argsStr + ') using JSON.parse';
			}

			return {
				name: name,
				args: args
			};
		}

		return {
			name: str
		};
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




	TextStub = function ( token ) {
		this.type = types.TEXT;
		this.text = token.value;
	};

	TextStub.prototype = {
		toJson: function () {
			// this will be used as text, so we need to decode things like &amp;
			return this.decoded || ( this.decoded = decodeCharacterReferences( this.text) );
		},

		toString: function () {
			// this will be used as straight text
			return this.text;
		},

		decodeCharacterReferences: function () {
			
		}
	};


	ElementStub = function ( token, parentFragment ) {
		var items, attributes, numAttributes, i, attribute, preserveWhitespace;

		this.type = types.ELEMENT;

		this.tag = token.tag;
		this.parentFragment = parentFragment;
		this.parentElement = parentFragment.parentElement;

		items = token.attributes.items;
		numAttributes = items.length;
		if ( numAttributes ) {
			attributes = [];
			
			for ( i=0; i<numAttributes; i+=1 ) {
				attribute = {
					name: items[i].name.value
				};

				if ( !items[i].value.isNull ) {
					attribute.value = getFragmentStubFromTokens( items[i].value.tokens, this.parentFragment.priority + 1 );
				}

				attributes[i] = attribute;
			}

			this.attributes = attributes;
		}

		// if this is a void element, or a self-closing tag, seal the element
		if ( token.isSelfClosingTag || voidElementNames.indexOf( token.tag.toLowerCase() ) !== -1 ) {
			return;
		}

		// preserve whitespace if parent fragment has preserveWhitespace flag, or
		// if this is a <pre> element
		preserveWhitespace = parentFragment.preserveWhitespace || this.tag.toLowerCase() === 'pre';
		
		this.fragment = new FragmentStub( this, parentFragment.priority + 1, preserveWhitespace );
	};

	ElementStub.prototype = {
		read: function ( token ) {
			return this.fragment && this.fragment.read( token );
		},

		toJson: function ( noStringify ) {
			var json, attrName, attrValue, str, i;

			json = {
				type: types.ELEMENT,
				tag: this.tag
			};

			if ( this.attributes ) {
				json.attrs = {};

				for ( i=0; i<this.attributes.length; i+=1 ) {
					attrName = this.attributes[i].name;

					// empty attributes (e.g. autoplay, checked)
					if( this.attributes[i].value === undefined ) {
						attrValue = null;
					}

					else {
						// can we stringify the value?
						str = this.attributes[i].value.toString();

						if ( str !== false ) { // need to explicitly check, as '' === false
							attrValue = str;
						} else {
							attrValue = this.attributes[i].value.toJson();
						}
					}

					json.attrs[ attrName ] = attrValue;
				}
			}

			if ( this.fragment && this.fragment.items.length ) {
				json.frag = this.fragment.toJson( noStringify );
			}

			return json;
		},

		toString: function () {
			var str, i, len, attrStr, attrValueStr, fragStr, isVoid;

			// if this isn't an HTML element, it can't be stringified (since the only reason to stringify an
			// element is to use with innerHTML, and SVG doesn't support that method
			if ( allElementNames.indexOf( this.tag.toLowerCase() ) === -1 ) {
				return false;
			}

			// see if children can be stringified (i.e. don't contain mustaches)
			fragStr = ( this.fragment ? this.fragment.toString() : '' );
			if ( fragStr === false ) {
				return false;
			}

			// is this a void element?
			isVoid = ( voidElementNames.indexOf( this.tag.toLowerCase() ) !== -1 );

			str = '<' + this.tag;
			
			if ( this.attributes ) {
				for ( i=0, len=this.attributes.length; i<len; i+=1 ) {
					
					// does this look like a namespaced attribute? if so we can't stringify it
					if ( this.attributes[i].name.indexOf( ':' ) !== -1 ) {
						return false;
					}

					attrStr = ' ' + this.attributes[i].name;

					// empty attributes
					if ( this.attributes[i].value !== undefined ) {
						attrValueStr = this.attributes[i].value.toString();

						if ( attrValueStr === false ) {
							return false;
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
			if ( this.isSelfClosing && !isVoid ) {
				str += '/>';
				return str;
			}

			str += '>';

			// void element? we're done
			if ( isVoid ) {
				return str;
			}

			// if this has children, add them
			str += fragStr;

			str += '</' + this.tag + '>';
			return str;
		}
	};



	SectionStub = function ( token, parentFragment ) {
		this.type = types.SECTION;
		this.parentFragment = parentFragment;

		this.ref = token.ref;
		this.inverted = ( token.type === types.INVERTED );
		this.formatters = token.formatters;
		this.i = token.i;

		this.fragment = new FragmentStub( this, parentFragment.priority + 1, parentFragment.preserveWhitespace );
	};

	SectionStub.prototype = {
		read: function ( token ) {
			return this.fragment.read( token );
		},

		toJson: function ( noStringify ) {
			var json;

			json = {
				type: types.SECTION,
				ref: this.ref
			};

			if ( this.fragment ) {
				json.frag = this.fragment.toJson( noStringify );
			}

			if ( this.formatters && this.formatters.length ) {
				json.fmtrs = this.formatters.map( getFormatter );
			}

			if ( this.inverted ) {
				json.inv = true;
			}

			if ( this.priority ) {
				json.p = this.parentFragment.priority;
			}

			if ( this.i ) {
				json.i = this.i;
			}

			return json;
		},

		toString: function () {
			// sections cannot be stringified
			return false;
		}
	};


	MustacheStub = function ( token, priority ) {
		this.type = token.type;
		this.priority = priority;

		this.ref = token.ref;
		this.formatters = token.formatters;
	};

	MustacheStub.prototype = {
		toJson: function () {
			var json = {
				type: this.type,
				ref: this.ref
			};

			if ( this.formatters ) {
				json.fmtrs = this.formatters.map( getFormatter );
			}

			if ( this.priority ) {
				json.p = this.priority;
			}

			return json;
		},

		toString: function () {
			// mustaches cannot be stringified
			return false;
		}
	};




	FragmentStub = function ( owner, priority, preserveWhitespace ) {
		this.owner = owner;
		this.items = [];

		this.preserveWhitespace = preserveWhitespace;

		if ( owner ) {
			this.parentElement = ( owner.type === types.ELEMENT ? owner : owner.parentElement );
		}

		this.priority = priority;
	};

	FragmentStub.prototype = {
		read: function ( token ) {

			if ( this.sealed ) {
				return false;
			}
			
			// does this token implicitly close this fragment? (e.g. an <li> without a </li> being closed by another <li>)
			if ( this.isImplicitlyClosedBy( token ) ) {
				this.seal();
				return false;
			}


			// do we have an open child section/element?
			if ( this.currentChild ) {

				// can it use this token?
				if ( this.currentChild.read( token ) ) {
					return true;
				}

				// if not, we no longer have an open child
				this.currentChild = null;
			}

			// does this token explicitly close this fragment?
			if ( this.isExplicitlyClosedBy( token ) ) {
				this.seal();
				return true;
			}

			// time to create a new child...

			// (...unless this is a section closer or a delimiter change or a comment)
			if ( token.type === types.CLOSING || token.type === types.DELIMCHANGE || token.type === types.COMMENT ) {
				return false;
			}

			// section?
			if ( token.type === types.SECTION || token.type === types.INVERTED ) {
				this.currentChild = new SectionStub( token, this );
				this.items[ this.items.length ] = this.currentChild;
				return true;
			}

			// element?
			if ( token.type === types.TAG ) {
				this.currentChild = new ElementStub( token, this );
				this.items[ this.items.length ] = this.currentChild;
				return true;
			}

			// text or attribute value?
			if ( token.type === types.TEXT || token.type === types.ATTR_VALUE_TOKEN ) {
				this.items[ this.items.length ] = new TextStub( token );
				return true;
			}

			// none of the above? must be a mustache
			this.items[ this.items.length ] = new MustacheStub( token, this.priority );
			return true;
		},

		isClosedBy: function ( token ) {
			return this.isImplicitlyClosedBy( token ) || this.isExplicitlyClosedBy( token );
		},


		isImplicitlyClosedBy: function ( token ) {
			var implicitClosers, element, parentElement, thisTag, tokenTag;

			if ( !token.tag || !this.owner || ( this.owner.type !== types.ELEMENT ) ) {
				return false;
			}

			thisTag = this.owner.tag.toLowerCase();
			tokenTag = token.tag.toLowerCase();
			
			element = this.owner;
			parentElement = element.parentElement || null;

			// if this is an element whose end tag can be omitted if followed by an element
			// which is an 'implicit closer', return true
			implicitClosers = implicitClosersByTagName[ thisTag ];

			if ( implicitClosers ) {
				if ( !token.isClosingTag && implicitClosers.indexOf( tokenTag ) !== -1 ) {
					return true;
				}
			}

			// if this is an element that is closed when its parent closes, return true
			if ( closedByParentClose.indexOf( thisTag ) !== -1 ) {
				if ( parentElement && parentElement.fragment.isClosedBy( token ) ) {
					return true;
				}
			}

			// special cases
			// p element end tag can be omitted when parent closes if it is not an a element
			if ( thisTag === 'p' ) {
				if ( parentElement && parentElement.tag.toLowerCase() === 'a' && parentElement.fragment.isClosedBy( token ) ) {
					return true;
				}
			}
		},

		isExplicitlyClosedBy: function ( token ) {
			if ( !this.owner ) {
				return false;
			}

			if ( this.owner.type === types.SECTION ) {
				if ( token.type === types.CLOSING && token.ref === this.owner.ref ) {
					return true;
				}
			}

			if ( this.owner.type === types.ELEMENT && this.owner ) {
				if ( token.isClosingTag && ( token.tag.toLowerCase() === this.owner.tag.toLowerCase() ) ) {
					return true;
				}
			}
		},

		toJson: function ( noStringify ) {
			var result = [], i, len, str;

			// can we stringify this?
			if ( !noStringify ) {
				str = this.toString();
				if ( str !== false ) {
					return str;
				}
			}

			for ( i=0, len=this.items.length; i<len; i+=1 ) {
				result[i] = this.items[i].toJson( noStringify );
			}

			return result;
		},

		toString: function () {
			var str = '', i, len, itemStr;

			for ( i=0, len=this.items.length; i<len; i+=1 ) {
				itemStr = this.items[i].toString();
				
				// if one of the child items cannot be stringified (i.e. contains a mustache) return false
				if ( itemStr === false ) {
					return false;
				}

				str += itemStr;
			}

			return str;
		},

		seal: function () {
			var first, last, i, item;

			this.sealed = true;

			// if this is an element fragment, remove leading and trailing whitespace
			if ( !this.preserveWhitespace ) {
				if ( this.owner.type === types.ELEMENT ) {
					first = this.items[0];

					if ( first && first.type === types.TEXT ) {
						first.text = first.text.replace( /^\s*/, '' );
						if ( first.text === '' ) {
							this.items.shift();
						}
					}

					last = this.items[ this.items.length - 1 ];

					if ( last && last.type === types.TEXT ) {
						last.text = last.text.replace( /\s*$/, '' );
						if ( last.text === '' ) {
							this.items.pop();
						}
					}
				}

				// collapse multiple whitespace characters
				i = this.items.length;
				while ( i-- ) {
					item = this.items[i];
					if ( item.type === types.TEXT ) {
						item.text = item.text.replace( /\s{2,}/g, ' ' );
					}
				}
			}

			if ( !this.items.length ) {
				delete this.owner.fragment;
			}
		}
	};


	getFragmentStubFromTokens = function ( tokens, priority, preserveWhitespace ) {
		var fragStub = new FragmentStub( null, priority, preserveWhitespace ), token;

		while ( tokens.length ) {
			token = tokens.shift();
			fragStub.read( token );
		}

		return fragStub;
	};
	

}( Ractive, _private ));