(function () {

	'use strict';

	// IE shims
	if ( !Date.now ) {
		Date.now = function () { return +new Date(); };
	}

	// TODO....

}());

/*! ractive - v0.1.7 - 2013-03-23
* http://rich-harris.github.com/Ractive/
* Copyright (c) 2013 Rich Harris; Licensed MIT */

/*jslint eqeq: true, plusplus: true */
/*global document, HTMLElement */


(function ( global ) {

"use strict";var Ractive = (function () {

	'use strict';

	var Ractive, getEl;

	Ractive = function ( options ) {

		var defaults, key;

		// Options
		// -------

		if ( options ) {
			for ( key in options ) {
				if ( options.hasOwnProperty( key ) ) {
					this[ key ] = options[ key ];
				}
			}
		}

		defaults = {
			preserveWhitespace: false,
			append: false,
			twoway: true,
			formatters: {},
			modifyArrays: true
		};

		for ( key in defaults ) {
			if ( defaults.hasOwnProperty( key ) && this[ key ] === undefined ) {
				this[ key ] = defaults[ key ];
			}
		}


		// Initialization
		// --------------

		if ( this.el !== undefined ) {
			this.el = getEl( this.el ); // turn ID string into DOM element
		}

		// Set up event bus
		this._subs = {};

		if ( this.viewmodel === undefined ) {
			this.viewmodel = new Ractive.ViewModel();
		}

		// bind viewmodel to this ractive instance
		this.viewmodel.dependents.push( this );

		// Initialise (or update) viewmodel with data
		if ( this.data ) {
			this.viewmodel.set( this.data );
		}

		// If we were given uncompiled partials, compile them
		if ( this.partials ) {
			for ( key in this.partials ) {
				if ( this.partials.hasOwnProperty( key ) ) {
					if ( typeof this.partials[ key ] === 'string' ) {
						if ( !Ractive.compile ) {
							throw new Error( 'Missing Ractive.compile - cannot compile partial "' + key + '". Either precompile or use the version that includes the compiler' );
						}

						this.partials[ key ] = Ractive.compile( this.partials[ key ], this ); // all compiler options are present on `this`, so just passing `this`
					}
				}
			}
		}

		// Compile template, if it hasn't been compiled already
		if ( typeof this.template === 'string' ) {
			if ( !Ractive.compile ) {
				throw new Error( 'Missing Ractive.compile - cannot compile template. Either precompile or use the version that includes the compiler' );
			}

			this.template = Ractive.compile( this.template, this );
		}

		// If passed an element, render immediately
		if ( this.el ) {
			this.render({ el: this.el, callback: this.callback, append: this.append });
		}
	};



	// Prototype methods
	// =================
	Ractive.prototype = {

		// Render instance to element specified here or at initialization
		render: function ( options ) {
			var el = ( options.el ? getEl( options.el ) : this.el );

			if ( !el ) {
				throw new Error( 'You must specify a DOM element to render to' );
			}

			// Clear the element, unless `append` is `true`
			if ( !options.append ) {
				el.innerHTML = '';
			}

			if ( options.callback ) {
				this.callback = options.callback;
			}

			// Render our *root fragment*
			this.rendered = new Ractive.DomFragment({
				model: this.template,
				root: this,
				parentNode: el
			});
		},

		// Teardown. This goes through the root fragment and all its children, removing observers
		// and generally cleaning up after itself
		teardown: function () {
			this.rendered.teardown();
		},

		// Proxies for viewmodel `set`, `get`, `update`, `observe` and `unobserve` methods
		set: function () {
			this.viewmodel.set.apply( this.viewmodel, arguments );
			return this;
		},

		get: function () {
			return this.viewmodel.get.apply( this.viewmodel, arguments );
		},

		update: function () {
			this.viewmodel.update.apply( this.viewmodel, arguments );
			return this;
		},

		// Internal method to format a value, using formatters passed in at initialization
		_format: function ( value, formatters ) {
			var i, numFormatters, formatter, name, args, fn;

			// If there are no formatters, groovy - just return the value unchanged
			if ( !formatters ) {
				return value;
			}

			// Otherwise go through each in turn, applying sequentially
			numFormatters = formatters.length;
			for ( i=0; i<numFormatters; i+=1 ) {
				formatter = formatters[i];
				name = formatter.name;
				args = formatter.args || [];

				// If a formatter was passed in, use it, otherwise see if there's a default
				// one with this name
				fn = this.formatters[ name ] || Ractive.formatters[ name ];

				if ( fn ) {
					value = fn.apply( this, [ value ].concat( args ) );
				}
			}

			return value;
		}
	};


	// helper functions
	getEl = function ( input ) {
		var output, doc;

		if ( typeof window === 'undefined' ) {
			return;
		}

		doc = window.document;

		if ( !input ) {
			throw new Error( 'No container element specified' );
		}

		// We already have a DOM node - no work to do
		if ( input.tagName ) {
			return input;
		}

		// Get node from string
		if ( typeof input === 'string' ) {
			// try ID first
			output = doc.getElementById( input );

			// then as selector, if possible
			if ( !output && doc.querySelector ) {
				output = doc.querySelector( input );
			}

			// did it work?
			if ( output.tagName ) {
				return output;
			}
		}

		// If we've been given a collection (jQuery, Zepto etc), extract the first item
		if ( input[0] && input[0].tagName ) {
			return input[0];
		}

		throw new Error( 'Could not find container element' );
	};

	return Ractive;

}());
(function ( A ) {

	'use strict';

	A.types = {
		TEXT:             1,
		INTERPOLATOR:     2,
		TRIPLE:           3,
		SECTION:          4,
		INVERTED:         5,
		CLOSING:          6,
		ELEMENT:          7,
		PARTIAL:          8,
		COMMENT:          9,
		DELIMCHANGE:      10,
		MUSTACHE:         11,
		TAG:              12,
		ATTR_VALUE_TOKEN: 13
	};

}( Ractive ));
(function ( A ) {

	'use strict';

	var isArray, isObject;

	// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
	isArray = function ( obj ) {
		return Object.prototype.toString.call( obj ) === '[object Array]';
	};

	isObject = function ( obj ) {
		return ( Object.prototype.toString.call( obj ) === '[object Object]' ) && ( typeof obj !== 'function' );
	};

	A._Mustache = function ( options ) {

		this.root           = options.root;
		this.model          = options.model;
		this.viewmodel      = options.root.viewmodel;
		this.parent         = options.parent;
		this.parentFragment = options.parentFragment;
		this.contextStack   = options.contextStack || [];
		this.index          = options.index || 0;

		// DOM only
		if ( options.parentNode || options.anchor ) {
			this.parentNode = options.parentNode;
			this.anchor = options.anchor;
		}

		this.type = options.model.type;

		if ( this.initialize ) {
			this.initialize();
		}

		this.viewmodel.registerView( this );

		// if we have a failed keypath lookup, and this is an inverted section,
		// we need to trigger this.update() so the contents are rendered
		if ( !this.keypath && this.model.inv ) { // test both section-hood and inverticity in one go
			this.update( false );
		}

	};


	A._Fragment = function ( options ) {

		var numItems, i, itemOptions, parentRefs, ref;

		if ( this.preInit ) {
			if ( this.preInit( options ) ) {
				return;
			}
		}

		this.parent = options.parent;
		this.index = options.index;
		this.items = [];

		this.indexRefs = {};
		if ( this.parent && this.parent.parentFragment ) {
			parentRefs = this.parent.parentFragment.indexRefs;
			for ( ref in parentRefs ) {
				if ( parentRefs.hasOwnProperty( ref ) ) {
					this.indexRefs[ ref ] = parentRefs[ ref ];
				}
			}
		}

		if ( options.indexRef ) {
			this.indexRefs[ options.indexRef ] = options.index;
		}

		itemOptions = {
			root: options.root,
			parentFragment: this,
			parent: this,
			parentNode:     options.parentNode,
			contextStack: options.contextStack
		};

		numItems = ( options.model ? options.model.length : 0 );
		for ( i=0; i<numItems; i+=1 ) {
			itemOptions.model = options.model[i];
			itemOptions.index = i;
			// this.items[ this.items.length ] = createView( itemOptions );

			this.items[ this.items.length ] = this.createItem( itemOptions );
		}

	};


	A._sectionUpdate = function ( value ) {
		var fragmentOptions, valueIsArray, emptyArray, i, itemsToRemove;

		fragmentOptions = {
			model: this.model.frag,
			root: this.root,
			parentNode: this.parentNode,
			parent: this
		};

		// TODO if DOM type, need to know anchor
		if ( this.parentNode ) {
			fragmentOptions.anchor = this.parentFragment.findNextNode( this );
		}

		valueIsArray = isArray( value );

		// modify the array to allow updates via push, pop etc
		if ( valueIsArray && this.root.modifyArrays ) {
			A.modifyArray( value, this.keypath, this.root.viewmodel );
		}

		// treat empty arrays as false values
		if ( valueIsArray && value.length === 0 ) {
			emptyArray = true;
		}



		// if section is inverted, only check for truthiness/falsiness
		if ( this.model.inv ) {
			if ( value && !emptyArray ) {
				if ( this.length ) {
					this.unrender();
					this.length = 0;
				}
			}

			else {
				if ( !this.length ) {
					// no change to context stack in this situation
					fragmentOptions.contextStack = this.contextStack;
					fragmentOptions.index = 0;

					this.fragments[0] = this.createFragment( fragmentOptions );
					this.length = 1;
					return;
				}
			}

			if ( this.postUpdate ) {
				this.postUpdate();
			}

			return;
		}


		// otherwise we need to work out what sort of section we're dealing with

		// if value is an array, iterate through
		if ( valueIsArray ) {

			// if the array is shorter than it was previously, remove items
			if ( value.length < this.length ) {
				itemsToRemove = this.views.splice( value.length, this.length - value.length );

				while ( itemsToRemove.length ) {
					itemsToRemove.pop().teardown();
				}
			}

			// otherwise...
			else {

				if ( value.length > this.length ) {
					// add any new ones
					for ( i=this.length; i<value.length; i+=1 ) {
						// append list item to context stack
						fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
						fragmentOptions.index = i;

						if ( this.model.i ) {
							fragmentOptions.indexRef = this.model.i;
						}

						this.fragments[i] = this.createFragment( fragmentOptions );
					}
				}
			}

			this.length = value.length;
		}


		// if value is a hash...
		else if ( isObject( value ) ) {
			// ...then if it isn't rendered, render it, adding this.keypath to the context stack
			// (if it is already rendered, then any children dependent on the context stack
			// will update themselves without any prompting)
			if ( !this.length ) {
				// append this section to the context stack
				fragmentOptions.contextStack = this.contextStack.concat( this.keypath );
				fragmentOptions.index = 0;

				this.fragments[0] = this.createFragment( fragmentOptions );
				this.length = 1;
			}
		}


		// otherwise render if value is truthy, unrender if falsy
		else {

			if ( value && !emptyArray ) {
				if ( !this.length ) {
					// no change to context stack
					fragmentOptions.contextStack = this.contextStack;
					fragmentOptions.index = 0;

					this.fragments[0] = this.createFragment( fragmentOptions );
					this.length = 1;
				}
			}

			else {
				if ( this.length ) {
					this.unrender();
					this.length = 0;
				}
			}
		}


		if ( this.postUpdate ) {
			this.postUpdate();
		}


	};




}( Ractive ));
(function ( proto ) {

	'use strict';

	proto.on = function ( eventName, callback ) {
		var self = this;

		if ( !this._subs[ eventName ] ) {
			this._subs[ eventName ] = [ callback ];
		} else {
			this._subs[ eventName ].push( callback );
		}

		return {
			cancel: function () {
				self.off( eventName, callback );
			}
		};
	};

	proto.off = function ( eventName, callback ) {
		var subscribers, index;

		// if no callback specified, remove all callbacks
		if ( !callback ) {
			// if no event name specified, remove all callbacks for all events
			if ( !eventName ) {
				this._subs = {};
			} else {
				this._subs[ eventName ] = [];
			}
		}

		subscribers = this._subs[ eventName ];

		if ( subscribers ) {
			index = subscribers.indexOf( callback );
			if ( index !== -1 ) {
				subscribers.splice( index, 1 );
			}
		}
	};

	proto.fire = function ( eventName ) {
		var args, i, len, subscribers = this._subs[ eventName ];

		if ( !subscribers ) {
			return;
		}

		args = Array.prototype.slice.call( arguments, 1 );

		for ( i=0, len=subscribers.length; i<len; i+=1 ) {
			subscribers[i].apply( this, args );
		}
	};

}( Ractive.prototype ));
var Ractive = Ractive || {}; // in case we're not using the runtime

(function ( A ) {

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


	A.compile = function ( template, options ) {
		var tokens, fragmentStub;

		options = options || {};

		// If delimiters are specified use them, otherwise reset to defaults
		A.delimiters = options.delimiters || [ '{{', '}}' ];
		A.tripleDelimiters = options.tripleDelimiters || [ '{{{', '}}}' ];

		tokens = A.tokenize( template );
		fragmentStub = getFragmentStubFromTokens( tokens );
		
		return fragmentStub.toJson();
	};


	types = A.types;

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
		var items, attributes, numAttributes, i;

		this.type = types.ELEMENT;

		this.tag = token.tag;
		this.parentFragment = parentFragment;
		this.parentElement = parentFragment.parentElement;

		items = token.attributes.items;
		numAttributes = items.length;
		if ( numAttributes ) {
			attributes = [];
			
			for ( i=0; i<numAttributes; i+=1 ) {
				attributes[i] = {
					name: items[i].name.value,
					value: getFragmentStubFromTokens( items[i].value.tokens, this.parentFragment.priority + 1 )
				};
			}

			this.attributes = attributes;
		}

		// if this is a void element, or a self-closing tag, seal the element
		if ( token.isSelfClosingTag || voidElementNames.indexOf( token.tag.toLowerCase() ) !== -1 ) {
			return;
		}
		
		this.fragment = new FragmentStub( this, parentFragment.priority + 1 );
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

					// can we stringify the value?
					str = this.attributes[i].value.toString();
					if ( str !== false ) { // need to explicitly check, as '' === false
						attrValue = str;
					} else {
						attrValue = this.attributes[i].value.toJson();
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

		this.fragment = new FragmentStub( this, parentFragment.priority + 1 );
	};

	SectionStub.prototype = {
		read: function ( token ) {
			return this.fragment.read( token );
		},

		toJson: function ( noStringify ) {
			var json;

			json = {
				type: types.SECTION,
				ref: this.ref,
				frag: this.fragment.toJson( noStringify )
			};

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




	FragmentStub = function ( owner, priority ) {
		this.owner = owner;
		this.items = [];

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
			this.sealed = true;
		}
	};


	getFragmentStubFromTokens = function ( tokens, priority ) {
		var fragStub = new FragmentStub( null, priority || 0 ), token;

		while ( tokens.length ) {
			token = tokens.shift();
			fragStub.read( token );
		}

		return fragStub;
	};
	

}( Ractive ));
/*global Ractive */
/*jslint white: true */

(function ( A ) {
	
	'use strict';

	var types,
		whitespace,

		stripHtmlComments,

		TokenStream,
		MustacheBuffer,
		
		TextToken,
		MustacheToken,
		TripleToken,
		TagToken,
		AttributeValueToken,

		mustacheTypes,
		OpeningBracket,
		TagName,
		AttributeCollection,
		Solidus,
		ClosingBracket,
		Attribute,
		AttributeName,
		AttributeValue;



	A.tokenize = function ( template ) {
		var stream = TokenStream.fromString( stripHtmlComments( template ) );
		return stream.tokens;
	};
	
	
	// TokenStream generates an array of tokens from an HTML string
	TokenStream = function () {
		this.tokens = [];
		this.buffer = new MustacheBuffer();
	};

	TokenStream.prototype = {
		read: function ( char ) {
			var mustacheToken, bufferValue;

			// if we're building a tag, send everything to it including delimiter characters
			if ( this.currentToken && this.currentToken.type === types.TAG ) {
				if ( this.currentToken.read( char ) ) {
					return true;
				}
			}

			// either we're not building a tag, or the character was rejected
			
			// send to buffer. if accepted, we don't need to do anything else
			if ( this.buffer.read( char ) ) {
				return true;
			}
			
			// can we convert the buffer to a mustache or triple?
			mustacheToken = this.buffer.convert();

			if ( mustacheToken ) {
				// if we were building a token, seal it
				if ( this.currentToken ) {
					this.currentToken.seal();
				}

				// start building the new mustache instead
				this.currentToken = this.tokens[ this.tokens.length ] = mustacheToken;
				return true;
			}


			// could not convert to a mustache. can we append to current token?
			bufferValue = this.buffer.release();

			if ( this.currentToken ) {
				while ( bufferValue.length ) {
					while ( bufferValue.length && this.currentToken.read( bufferValue.charAt( 0 ) ) ) {
						bufferValue = bufferValue.substring( 1 );
					}

					// still got something left over? create a new token
					if ( bufferValue.length ) {
						if ( bufferValue.charAt( 0 ) === '<' ) {
							this.currentToken = new TagToken();
							this.currentToken.read( '<' );
						} else {
							this.currentToken = new TextToken();
							this.currentToken.read( bufferValue.charAt( 0 ) );
						}

						this.tokens[ this.tokens.length ] = this.currentToken;
						bufferValue = bufferValue.substring( 1 );
					}
				}

				return true;
			}

			// otherwise we need to create a new token
			if ( char === '<' ) {
				this.currentToken = new TagToken();
			} else {
				this.currentToken = new TextToken();
			}

			this.currentToken.read( char );
			this.tokens[ this.tokens.length ] = this.currentToken;
			return true;
		},

		end: function () {
			if ( !this.buffer.isEmpty() ) {
				this.tokens[ this.tokens.length ] = this.buffer.convert();
			}
		}
	};

	TokenStream.fromString = function ( string ) {
		var stream, i, len;

		stream = new TokenStream();
		i = 0;
		len = string.length;

		while ( i < len ) {
			stream.read( string.charAt( i ) );
			i += 1;
		}

		stream.end();

		return stream;
	};


	// MustacheBuffer intercepts characters in the token stream and determines
	// whether they could be a mustache/triple delimiter
	MustacheBuffer = function () {
		this.value = '';
	};

	MustacheBuffer.prototype = {
		read: function ( char ) {
			var continueBuffering;

			this.value += char;

			// if this could turn out to be a tag, a mustache or a triple return true
			continueBuffering = ( this.isPartialMatchOf( A.delimiters[0] ) || this.isPartialMatchOf( A.tripleDelimiters[0] ) );
			return continueBuffering;
		},

		convert: function () {
			var value, mustache, triple, token, getTriple, getMustache;

			// store mustache and triple opening delimiters
			mustache = A.delimiters[0];
			triple = A.tripleDelimiters[0];

			value = this.value;

			getTriple = function () {
				if ( value.indexOf( triple ) === 0 ) {
					return new TripleToken();
				}
			};

			getMustache = function () {
				if ( value.indexOf( mustache ) === 0 ) {
					return new MustacheToken();
				}
			};

			// out of mustache and triple opening delimiters, try to match longest first.
			// if they're the same length then only one will match anyway, unless some
			// plonker has set them to the same thing (which should probably throw an error)
			if ( triple.length > mustache.length ) {
				token = getTriple() || getMustache();
			} else {
				token = getMustache() || getTriple();
			}

			if ( token ) {
				while ( this.value.length ) {
					token.read( this.value.charAt( 0 ) );
					this.value = this.value.substring( 1 );
				}

				return token;
			}

			return false;
		},

		release: function () {
			var value = this.value;
			this.value = '';
			return value;
		},

		isEmpty: function () {
			return !this.value.length;
		},

		isPartialMatchOf: function ( str ) {
			// if str begins with this.value, the index will be 0
			return str.indexOf( this.value ) === 0;
		}
	};

	


	TextToken = function () {
		this.type = types.TEXT;
		this.value = '';
	};

	TextToken.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			// this can be anything except a '<'
			if ( char === '<' ) {
				return false;
			}

			this.value += char;
			return true;
		},

		seal: function () {
			this.sealed = true;
		}
	};


	


	MustacheToken = function () {
		this.value = '';
		this.openingDelimiter = A.delimiters[0];
		this.closingDelimiter = A.delimiters[1];
	};

	TripleToken = function () {
		this.value = '';
		this.openingDelimiter = A.tripleDelimiters[0];
		this.closingDelimiter = A.tripleDelimiters[1];

		this.type = types.TRIPLE;
	};

	MustacheToken.prototype = TripleToken.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			this.value += char;

			if ( this.value.substr( -this.closingDelimiter.length ) === this.closingDelimiter ) {
				this.seal();
			}

			return true;
		},

		seal: function () {
			var trimmed, firstChar, identifiers, pattern, match;

			if ( this.sealed ) {
				return;
			}

			// lop off opening and closing delimiters, and leading/trailing whitespace
			trimmed = this.value.replace( this.openingDelimiter, '' ).replace( this.closingDelimiter, '' ).trim();

			// are we dealing with a delimiter change?
			if ( trimmed.charAt( 0 ) === '=' ) {
				this.changeDelimiters( trimmed );
				this.type = types.DELIMCHANGE;
			}

			// if type isn't TRIPLE or DELIMCHANGE, determine from first character
			if ( !this.type ) {

				firstChar = trimmed.charAt( 0 );
				if ( mustacheTypes[ firstChar ] ) {

					this.type = mustacheTypes[ firstChar ];
					trimmed = trimmed.substring( 1 ).trim();

				} else {
					this.type = types.INTERPOLATOR;
				}
			}

			// do we have a named index?
			if ( this.type === types.SECTION ) {
				pattern = /:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)$/;
				match = pattern.exec( trimmed );

				if ( match ) {
					this.i = match[1];
					trimmed = trimmed.substr( 0, trimmed.length - match[0].length );
				}
			}

			// get reference and any formatters
			identifiers = trimmed.split( '|' );

			this.ref = identifiers.shift().trim();

			if ( identifiers.length ) {
				this.formatters = identifiers.map( function ( name ) {
					return name.trim();
				});
			}

			// TODO
			this.sealed = true;
		},

		changeDelimiters: function ( str ) {
			var delimiters, newDelimiters;

			newDelimiters = /\=([^\s=]+)\s+([^\s=]+)=/.exec( str );
			delimiters = ( this.type === types.TRIPLE ? A.tripleDelimiters : A.delimiters );

			delimiters[0] = newDelimiters[1];
			delimiters[1] = newDelimiters[2];
		}
	};


	
	




	TagToken = function () {
		this.type = types.TAG;

		this.openingBracket     = new OpeningBracket();
		this.closingTagSolidus  = new Solidus();
		this.tagName            = new TagName();
		this.attributes         = new AttributeCollection();
		this.selfClosingSolidus = new Solidus();
		this.closingBracket     = new ClosingBracket();
	};

	TagToken.prototype = {
		read: function ( char ) {
			var accepted;

			if ( this.sealed ) {
				return false;
			}

			// if there is room for this character, read it
			accepted = this.openingBracket.read( char ) ||
				this.closingTagSolidus.read( char )     ||
				this.tagName.read( char )               ||
				this.attributes.read( char )            ||
				this.selfClosingSolidus.read( char )    ||
				this.closingBracket.read( char );

			if ( accepted ) {
				// if closing bracket is sealed, so are we. save ourselves a trip
				if ( this.closingBracket.sealed ) {
					this.seal();
				}

				return true;
			}

			// otherwise we are done with this token
			this.seal();
			return false;
		},

		seal: function () {
			// time to figure out some stuff about this tag
			
			// tag name
			this.tag = this.tagName.value;

			// opening or closing tag?
			if ( this.closingTagSolidus.value ) {
				this.isClosingTag = true;
			}

			// self-closing?
			if ( this.selfClosingSolidus.value ) {
				this.isSelfClosingTag = true;
			}

			this.sealed = true;
		}
	};


	OpeningBracket = function () {};
	OpeningBracket.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			if ( char === '<' ) {
				this.value = '<';
				this.seal();
				return true;
			}

			throw 'Expected "<", saw "' + char + '"';
		},

		seal: function () {
			this.sealed = true;
		}
	};


	TagName = function () {};
	TagName.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			// first char must be a letter
			if ( !this.value ) {
				if ( /[a-zA-Z]/.test( char ) ) {
					this.value = char;
					return true;
				}
			}

			// subsequent characters can be letters, numbers or hyphens
			if ( /[a-zA-Z0-9\-]/.test( char ) ) {
				this.value += char;
				return true;
			}

			this.seal();
			return false;
		},

		seal: function () {
			this.sealed = true;
		}
	};

	



	AttributeCollection = function () {
		this.items = [];
	};

	AttributeCollection.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			// are we currently building an attribute?
			if ( this.nextItem ) {
				// can it take this character?
				if ( this.nextItem.read( char ) ) {
					return true;
				}
			}

			// ignore whitespace before attributes
			if ( whitespace.test( char ) ) {
				return true;
			}

			// if not, start a new attribute
			this.nextItem = new Attribute();

			// will it accept this character? if so add the new attribute
			if ( this.nextItem.read( char ) ) {
				this.items[ this.items.length ] = this.nextItem;
				return true;
			}

			// if not, we're done here
			this.seal();
			return false;
		},

		seal: function () {
			this.sealed = true;
		}
	};



	Attribute = function () {
		this.name = new AttributeName();
		this.value = new AttributeValue();
	};

	Attribute.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			// can we append this character to the attribute name?
			if ( this.name.read( char ) ) {
				return true;
			}
			
			// if not, only continue if we had a name in the first place
			if ( !this.name.value ) {
				this.seal();
				return false;
			}

			// send character to this.value
			if ( this.value.read( char ) ) {
				return true;
			}
			
			// rejected? okay, we're done
			this.seal();
			return false;
		},

		seal: function () {
			// TODO
			this.sealed = true;
		}
	};





	AttributeName = function () {};

	AttributeName.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			// first char?
			if ( !this.value ) {
				// first char must be letter, underscore or colon. (It really shouldn't be a colon.)
				if ( /[a-zA-Z_:]/.test( char ) ) {
					this.value = char;
					return true;
				}

				this.seal();
				return false;
			}

			// subsequent chars can be letters, numbers, underscores, colons, periods, or hyphens. Yeah. Nuts.
			if ( /[_:a-zA-Z0-9\.\-]/.test( char ) ) {
				this.value += char;
				return true;
			}

			this.seal();
			return false;
		},

		seal: function () {
			this.sealed = true;
		}
	};


	AttributeValue = function () {
		this.tokens = [];
		this.buffer = new MustacheBuffer();

		this.expected = false;
	};

	AttributeValue.prototype = {
		read: function ( char ) {
			var mustacheToken, bufferValue;

			if ( this.sealed ) {
				return false;
			}

			// have we had the = character yet?
			if ( !this.expected ) {
				// ignore whitespace between name and =
				if ( whitespace.test( char ) ) {
					return true;
				}

				// if we have the =, we can read in the value
				if ( char === '=' ) {
					this.expected = true;
					return true;
				}

				// anything else is an error
				return false;
			}

			
			if ( !this.tokens.length && !this.quoteMark ) {
				// ignore leading whitespace
				if ( whitespace.test( char ) ) {
					return true;
				}

				// if we get a " or a ', flag value as quoted
				if ( char === '"' || char === "'" ) {
					this.quoteMark = char;
					return true;
				}
			}


			// send character to buffer
			if ( this.buffer.read( char ) ) {
				return true;
			}


			// buffer rejected char. can we convert it to a mustache or triple?
			mustacheToken = this.buffer.convert();

			if ( mustacheToken ) {
				// if we were building a token, seal it
				if ( this.currentToken ) {
					this.currentToken.seal();
				}

				// start building the new mustache instead
				this.currentToken = this.tokens[ this.tokens.length ] = mustacheToken;
				return true;
			}


			// could not convert to a mustache. can we append to current token?
			bufferValue = this.buffer.release();

			if ( this.currentToken ) {
				while ( bufferValue.length ) {

					while ( bufferValue.length && bufferValue.charAt( 0 ) !== this.quoteMark && this.currentToken.read( bufferValue.charAt( 0 ) ) ) {
						bufferValue = bufferValue.substring( 1 );
					}

					// still got something left over? create a new token
					if ( bufferValue.length && bufferValue.charAt( 0 ) !== this.quoteMark ) {
						this.currentToken = new AttributeValueToken( this.quoteMark );
						this.currentToken.read( bufferValue.charAt( 0 ) );

						this.tokens[ this.tokens.length ] = this.currentToken;
						bufferValue = bufferValue.substring( 1 );
					}

					// closing quoteMark? seal value
					if ( bufferValue.charAt( 0 ) === this.quoteMark ) {
						this.currentToken.seal();
						this.seal();
						return true;
					}
				}

				return true;
			}

			// otherwise we need to create a new token
			this.currentToken = new AttributeValueToken( this.quoteMark );

			this.currentToken.read( char );
			this.tokens[ this.tokens.length ] = this.currentToken;

			if ( this.currentToken.sealed ) {
				this.seal();
			}

			return true;
		},

		seal: function () {
			this.sealed = true;
		}
	};


	AttributeValueToken = function ( quoteMark ) {
		this.type = types.ATTR_VALUE_TOKEN;

		this.quoteMark = quoteMark || '';
		this.value = '';
	};

	AttributeValueToken.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			if ( char === this.quoteMark ) {
				this.seal();
				return true;
			}

			// within quotemarks, anything goes
			if ( this.quoteMark ) {
				this.value += char;
				return true;
			}

			// without quotemarks, the following characters are invalid: whitespace, ", ', =, <, >, `
			if ( /[\s"'=<>`]/.test( char ) ) {
				this.seal();
				return false;
			}

			this.value += char;
			return true;
		},

		seal: function () {
			this.sealed = true;
		}
	};



	Solidus = function () {};
	Solidus.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			if ( char === '/' ) {
				this.value = '/';
				this.seal();
				return true;
			}

			this.seal();
			return false;
		},

		seal: function () {
			this.sealed = true;
		}
	};

	ClosingBracket = function () {};
	ClosingBracket.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			if ( char === '>' ) {
				this.value = '>';
				this.seal();
				return true;
			}

			throw 'Expected ">", received "' + char + '"';
		},

		seal: function () {
			this.sealed = true;
		}
	};



	stripHtmlComments = function ( html ) {
		var commentStart, commentEnd, processed;

		processed = '';

		while ( html.length ) {
			commentStart = html.indexOf( '<!--' );
			commentEnd = html.indexOf( '-->' );

			// no comments? great
			if ( commentStart === -1 && commentEnd === -1 ) {
				processed += html;
				break;
			}

			// comment start but no comment end
			if ( commentStart !== -1 && commentEnd === -1 ) {
				throw 'Illegal HTML - expected closing comment sequence (\'-->\')';
			}

			// comment end but no comment start, or comment end before comment start
			if ( ( commentEnd !== -1 && commentStart === -1 ) || ( commentEnd < commentStart ) ) {
				throw 'Illegal HTML - unexpected closing comment sequence (\'-->\')';
			}

			processed += html.substr( 0, commentStart );
			html = html.substring( commentEnd + 3 );
		}

		return processed;
	};

	types = A.types;
	whitespace = /\s/;
	mustacheTypes = {
		'#': types.SECTION,
		'^': types.INVERTED,
		'/': types.CLOSING,
		'>': types.PARTIAL,
		'!': types.COMMENT,
		'&': types.INTERPOLATOR
	};
	


}( Ractive ));
// Default formatters
(function ( A ) {
	
	'use strict';

	A.formatters = {
		equals: function ( a, b ) {
			return a === b;
		},

		greaterThan: function ( a, b ) {
			return a > b;
		},

		greaterThanEquals: function ( a, b ) {
			return a >= b;
		},

		lessThan: function ( a, b ) {
			return a < b;
		},

		lessThanEquals: function ( a, b ) {
			return a <= b;
		}
	};

}( Ractive ));
(function ( A ) {

	'use strict';

	var splitKeypath, keypathNormaliser;

	// ViewModel constructor
	A.ViewModel = function ( data ) {
		// Initialise with supplied data, or create an empty object
		this.data = data || {};

		// Create empty array for keypaths that can't be resolved initially
		this.pendingResolution = [];

		// Create empty object for observers
		this.observers = {};

		// Dependent Ractive instances
		this.dependents = [];
	};

	A.ViewModel.prototype = {

		// Update the `value` of `keypath`, and notify the observers of
		// `keypath` and its descendants
		set: function ( keypath, value ) {
			var k, keys, key, obj, i, unresolved, resolved, normalisedKeypath;

			// Allow multiple values to be set in one go
			if ( typeof keypath === 'object' ) {
				for ( k in keypath ) {
					if ( keypath.hasOwnProperty( k ) ) {
						this.set( k, keypath[k] );
					}
				}

				return;
			}

			// fire events
			this.dependents.forEach( function ( dep ) {
				if ( dep.setting ) {
					return; // short-circuit any potential infinite loops
				}

				dep.setting = true;
				dep.fire( 'set', keypath, value );
				dep.fire( 'set:' + keypath, value );
				dep.setting = false;
			});	


			// Split key path into keys (e.g. `'foo.bar[0]'` -> `['foo','bar',0]`)
			keys = splitKeypath( keypath );
			normalisedKeypath = keys.join( '.' );

			// TODO accommodate implicit array generation
			obj = this.data;
			while ( keys.length > 1 ) {
				key = keys.shift();
				obj = obj[ key ] || {};
			}

			key = keys[0];

			obj[ key ] = value;

			// Trigger updates of views that observe `keypaths` or its descendants
			this._notifyObservers( normalisedKeypath, value );

			// See if we can resolve any of the unresolved keypaths (if such there be)
			i = this.pendingResolution.length;
			while ( i-- ) { // Work backwards, so we don't go in circles!
				unresolved = this.pendingResolution.splice( i, 1 )[0];

				resolved = this.resolveRef( unresolved.view.model.ref, unresolved.view.contextStack );

				// If we were able to find a keypath, initialise the view
				if ( resolved ) {
					unresolved.callback( resolved.keypath, resolved.value );
				}

				// Otherwise add to the back of the queue (this is why we're working backwards)
				else {
					this.registerUnresolvedKeypath( unresolved );
				}
			}
		},

		// Get the current value of `keypath`
		get: function ( keypath ) {
			var keys, result;

			if ( !keypath ) {
				return undefined;
			}

			keys = splitKeypath( keypath );

			result = this.data;
			while ( keys.length ) {
				if ( result ) {
					result = result[ keys.shift() ];
				}

				if ( result === undefined ) {
					return result;
				}
			}

			if ( typeof result === 'function' ) {
				return result.call( this, keypath );
			}

			return result;
		},

		// Force notify observers of `keypath` (useful if e.g. an array or object member
		// was changed without calling `ractive.set()`)
		update: function ( keypath ) {
			var kp;

			if ( keypath ) {
				this._notifyObservers( keypath, this.get( keypath ) );
			}

			// no keypath? update all the things
			else {
				for ( kp in this.data ) {
					if ( this.data.hasOwnProperty( kp ) ) {
						this._notifyObservers( kp, this.get( kp ) );
					}
				}
			}
		},

		registerView: function ( view ) {
			var self = this, resolved, initialUpdate, value, index;

			if ( view.parentFragment && ( view.parentFragment.indexRefs.hasOwnProperty( view.model.ref ) ) ) {
				// this isn't a real keypath, it's an index reference
				index = view.parentFragment.indexRefs[ view.model.ref ];

				value = ( view.model.fmtrs ? view.root._format( index, view.model.fmtrs ) : index );
				view.update( value );

				return; // this value will never change, and doesn't have a keypath
			}

			initialUpdate = function ( keypath, value ) {
				view.keypath = keypath;

				// create observers
				view.observerRefs = self.observe({
					keypath: keypath,
					priority: view.model.p || 0,
					view: view
				});

				// pass value through formatters, if there are any
				if ( view.model.fmtrs ) {
					value = view.root._format( value, view.model.fmtrs );
				}

				view.update( value );
			};

			resolved = this.resolveRef( view.model.ref, view.contextStack );


			if ( !resolved ) {
				this.registerUnresolvedKeypath({
					view: view,
					callback: initialUpdate
				});
			} else {
				initialUpdate( resolved.keypath, resolved.value );
			}
		},

		// Resolve a full keypath from `ref` within the given `contextStack` (e.g.
		// `'bar.baz'` within the context stack `['foo']` might resolve to `'foo.bar.baz'`
		resolveRef: function ( ref, contextStack ) {

			var innerMost, keypath, value;

			// Implicit iterators - i.e. {{.}} - are a special case
			if ( ref === '.' ) {
				keypath = contextStack[ contextStack.length - 1 ];
				value = this.get( keypath );

				return { keypath: keypath, value: value };
			}

			// Clone the context stack, so we don't mutate the original
			contextStack = contextStack.concat();

			// Take each context from the stack, working backwards from the innermost context
			while ( contextStack.length ) {

				innerMost = contextStack.pop();

				keypath = innerMost + '.' + ref;
				value = this.get( keypath );

				if ( value !== undefined ) {
					return { keypath: keypath, value: value };
				}
			}

			value = this.get( ref );
			if ( value !== undefined ) {
				return { keypath: ref, value: value };
			}
		},

		registerUnresolvedKeypath: function ( unresolved ) {
			this.pendingResolution[ this.pendingResolution.length ] = unresolved;
		},

		_notifyObservers: function ( keypath, value ) {
			var self = this, observersGroupedByLevel = this.observers[ keypath ] || [], i, j, priority, observer, actualValue;

			for ( i=0; i<observersGroupedByLevel.length; i+=1 ) {
				priority = observersGroupedByLevel[i];

				if ( priority ) {
					for ( j=0; j<priority.length; j+=1 ) {
						observer = priority[j];

						if ( keypath !== observer.originalAddress ) {
							actualValue = self.get( observer.originalAddress );
						} else {
							actualValue = value;
						}

						// apply formatters, if there are any
						if ( observer.view.model.fmtrs ) {
							actualValue = observer.view.root._format( actualValue, observer.view.model.fmtrs );
						}

						observer.view.update( actualValue );
					}
				}
			}
		},

		observe: function ( options ) {

			var self = this, keypath, originalAddress = options.keypath, priority = options.priority, observerRefs = [], observe;

			// Allow `observe( keypath, callback )` syntax
			if ( arguments.length === 2 && typeof arguments[0] === 'string' && typeof arguments[1] === 'function' ) {
				return this.observe({ keypath: arguments[0], callback: arguments[1], priority: 0 });
			}

			if ( !options.keypath ) {
				return undefined;
			}

			observe = function ( keypath ) {
				var observers, observer;

				observers = self.observers[ keypath ] = self.observers[ keypath ] || [];
				observers = observers[ priority ] = observers[ priority ] || [];

				observer = {
					originalAddress: originalAddress
				};

				// if we're given a view to update, add it to the observer - ditto callbacks
				if ( options.view ) {
					observer.view = options.view;
				}

				if ( options.callback ) {
					observer.callback = options.callback;
				}

				observers[ observers.length ] = observer;
				observerRefs[ observerRefs.length ] = {
					keypath: keypath,
					priority: priority,
					observer: observer
				};
			};

			keypath = options.keypath;
			while ( keypath.lastIndexOf( '.' ) !== -1 ) {
				observe( keypath );

				// remove the last item in the keypath, so that data.set( 'parent', { child: 'newValue' } ) affects views dependent on parent.child
				keypath = keypath.substr( 0, keypath.lastIndexOf( '.' ) );
			}

			observe( keypath );

			return observerRefs;
		},

		unobserve: function ( observerRef ) {
			var priorities, observers, index, i, len;

			priorities = this.observers[ observerRef.keypath ];
			if ( !priorities ) {
				// nothing to unobserve
				return;
			}

			observers = priorities[ observerRef.priority ];
			if ( !observers ) {
				// nothing to unobserve
				return;
			}

			if ( observers.indexOf ) {
				index = observers.indexOf( observerRef.observer );
			} else {
				// fuck you IE
				for ( i=0, len=observers.length; i<len; i+=1 ) {
					if ( observers[i] === observerRef.observer ) {
						index = i;
						break;
					}
				}
			}


			if ( index === -1 ) {
				// nothing to unobserve
				return;
			}

			// remove the observer from the list...
			observers.splice( index, 1 );

			// ...then tidy up if necessary
			if ( observers.length === 0 ) {
				delete priorities[ observerRef.priority ];
			}

			if ( priorities.length === 0 ) {
				delete this.observers[ observerRef.keypath ];
			}
		},

		unobserveAll: function ( observerRefs ) {
			while ( observerRefs.length ) {
				this.unobserve( observerRefs.shift() );
			}
		}
	};


	if ( Array.prototype.filter ) { // Browsers that aren't unredeemable pieces of shit
		A.ViewModel.prototype.cancelKeypathResolution = function ( view ) {
			this.pendingResolution = this.pendingResolution.filter( function ( pending ) {
				return pending.view !== view;
			});
		};
	}

	else { // Internet Exploder
		A.ViewModel.prototype.cancelKeypathResolution = function ( view ) {
			var i, filtered = [];

			for ( i=0; i<this.pendingResolution.length; i+=1 ) {
				if ( this.pendingResolution[i].view !== view ) {
					filtered[ filtered.length ] = this.pendingResolution[i];
				}
			}

			this.pendingResolution = filtered;
		};
	}



	
	keypathNormaliser = /\[\s*([0-9]+)\s*\]/g;
	splitKeypath = function ( keypath ) {
		var normalised;

		// normalise keypath (e.g. 'foo[0]' becomes 'foo.0')
		normalised = keypath.replace( keypathNormaliser, '.$1' );

		return normalised.split( '.' );
	};



}( Ractive ));

(function ( A ) {

	'use strict';

	var types, insertHtml, elContains, doc,
		Text, Element, Partial, Attribute, Interpolator, Triple, Section;

	types = A.types;

	doc = ( typeof window !== 'undefined' ? window.document : null );

	elContains = function ( haystack, needle ) {
		// TODO!
		if ( haystack.contains ) {
			return haystack.contains( needle );
		}

		return true;
	};

	insertHtml = function ( html, parent, anchor ) {
		var div, i, len, nodes = [];

		anchor = anchor || null;

		div = doc.createElement( 'div' );
		div.innerHTML = html;

		len = div.childNodes.length;

		for ( i=0; i<len; i+=1 ) {
			nodes[i] = div.childNodes[i];
		}

		for ( i=0; i<len; i+=1 ) {
			parent.insertBefore( nodes[i], anchor );
		}

		return nodes;
	};

	A.DomFragment = function ( options ) {
		A._Fragment.call( this, options );
	};

	A.DomFragment.prototype = {
		preInit: function ( options ) {
			// if we have an HTML string, our job is easy.
			if ( typeof options.model === 'string' ) {
				this.nodes = insertHtml( options.model, options.parentNode, options.anchor );
				return true; // prevent the rest of the init sequence
			}
		},

		createItem: function ( options ) {
			if ( typeof options.model === 'string' ) {
				return new Text( options );
			}

			switch ( options.model.type ) {
				case types.INTERPOLATOR: return new Interpolator( options );
				case types.SECTION: return new Section( options );
				case types.TRIPLE: return new Triple( options );

				case types.ELEMENT: return new Element( options );
				case types.PARTIAL: return new Partial( options );

				default: throw 'WTF? not sure what happened here...';
			}
		},

		teardown: function () {
			var node;

			// if this was built from HTML, we just need to remove the nodes
			if ( this.nodes ) {
				while ( this.nodes.length ) {
					node = this.nodes.pop();
					node.parentNode.removeChild( node );
				}
				return;
			}

			// otherwise we need to do a proper teardown
			while ( this.items.length ) {
				this.items.pop().teardown();
			}
		},

		firstNode: function () {
			if ( this.items[0] ) {
				return this.items[0].firstNode();
			} 

			if ( this.parentSection ) {
				return this.parentSection.findNextNode( this );
			}

			return null;
		},

		findNextNode: function ( item ) {
			var index = item.index;

			if ( this.items[ index + 1 ] ) {
				return this.items[ index + 1 ].firstNode();
			}

			if ( this.parentSection ) {
				return this.parentSection.findNextNode( this );
			}

			return null;
		}
	};


	// Partials
	Partial = function ( options ) {
		this.fragment = new A.DomFragment({
			model:        options.root.partials[ options.model.ref ] || [],
			root:         options.root,
			parentNode:   options.parentNode,
			contextStack: options.contextStack,
			anchor:       options.anchor,
			parent:        this
		});
	};

	Partial.prototype = {
		teardown: function () {
			this.fragment.teardown();
		}
	};


	// Plain text
	Text = function ( options ) {
		this.node = doc.createTextNode( options.model );
		this.index = options.index;
		this.root = options.root;
		this.parentNode = options.parentNode;

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		this.parentNode.insertBefore( this.node, options.anchor || null );
	};

	Text.prototype = {
		teardown: function () {
			if ( elContains( this.root.el, this.node ) ) {
				this.parentNode.removeChild( this.node );
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Element
	Element = function ( options ) {

		var binding,
			model,
			namespace,
			attr,
			attrName,
			attrValue;

		// stuff we'll need later
		model = this.model = options.model;
		this.root = options.root;
		this.viewmodel = options.root.viewmodel;
		this.parentFragment = options.parentFragment;
		this.parentNode = options.parentNode;
		this.index = options.index;

		// get namespace
		if ( model.attrs && model.attrs.xmlns ) {
			namespace = model.attrs.xmlns;

			// check it's a string!
			if ( typeof namespace !== 'string' ) {
				throw 'Namespace attribute cannot contain mustaches';
			}
		} else {
			namespace = this.parentNode.namespaceURI;
		}
		

		// create the DOM node
		this.node = doc.createElementNS( namespace, model.tag );


		// set attributes
		this.attributes = [];
		for ( attrName in model.attrs ) {
			if ( model.attrs.hasOwnProperty( attrName ) ) {
				attrValue = model.attrs[ attrName ];

				attr = new Attribute({
					parent: this,
					name: attrName,
					value: attrValue,
					root: options.root,
					parentNode: this.node,
					contextStack: options.contextStack
				});

				// if two-way binding is enabled, and we've got a dynamic `value` attribute, and this is an input or textarea, set up two-way binding
				if ( attrName === 'value' && this.root.twoway && ( model.tag.toLowerCase() === 'input' || model.tag.toLowerCase() === 'textarea' ) ) {
					binding = attr;
				}

				this.attributes[ this.attributes.length ] = attr;
			}
		}

		if ( binding ) {
			this.bind( binding, options.root.lazy );
		}

		// append children, if there are any
		if ( model.frag ) {
			if ( typeof model.frag === 'string' ) {
				// great! we can use innerHTML
				this.node.innerHTML = model.frag;
			}

			else {
				this.children = new A.DomFragment({
					model:        model.frag,
					root:    options.root,
					parentNode:   this.node,
					contextStack: options.contextStack,
					anchor:       null,
					parent:        this
				});
			}
		}

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		this.parentNode.insertBefore( this.node, options.anchor || null );
	};

	Element.prototype = {
		bind: function ( attribute, lazy ) {

			var viewmodel = this.viewmodel, node = this.node, setValue, valid, interpolator, keypath;

			// Check this is a suitable candidate for two-way binding - i.e. it is
			// a single interpolator with no formatters
			valid = true;
			if ( !attribute.fragment ||
			     ( attribute.fragment.items.length !== 1 ) ||
			     ( attribute.fragment.items[0].type !== A.types.INTERPOLATOR ) ||
			     ( attribute.fragment.items[0].model.formatters && attribute.fragment.items[0].model.formatters.length )
			) {
				throw 'Not a valid two-way data binding candidate - must be a single interpolator with no formatters';
			}

			interpolator = attribute.fragment.items[0];

			// Hmmm. Not sure if this is the best way to handle this ambiguity...
			//
			// Let's say we were given `value="{{bar}}"`. If the context stack was
			// context stack was `["foo"]`, and `foo.bar` *wasn't* `undefined`, the
			// keypath would be `foo.bar`. Then, any user input would result in
			// `foo.bar` being updated.
			//
			// If, however, `foo.bar` *was* undefined, and so was `bar`, we would be
			// left with an unresolved partial keypath - so we are forced to make an
			// assumption. That assumption is that the input in question should
			// be forced to resolve to `bar`, and any user input would affect `bar`
			// and not `foo.bar`.
			//
			// Did that make any sense? No? Oh. Sorry. Well the moral of the story is
			// be explicit when using two-way data-binding about what keypath you're
			// updating. Using it in lists is probably a recipe for confusion...
			keypath = interpolator.keypath || interpolator.model.partialKeypath;

			setValue = function () {
				var value = node.value;

				// special cases
				if ( value === '0' ) {
					value = 0;
				}

				else if ( value !== '' ) {
					value = +value || value;
				}

				// Note: we're counting on `viewmodel.set` recognising that `value` is
				// already what it wants it to be, and short circuiting the process.
				// Rather than triggering an infinite loop...
				viewmodel.set( keypath, value );
			};

			// set initial value
			setValue();

			// TODO support shite browsers like IE and Opera
			node.addEventListener( 'change', setValue );

			if ( !lazy ) {
				node.addEventListener( 'keyup', setValue );
			}
		},

		teardown: function () {
			if ( elContains( this.root.el, this.node ) ) {
				this.parentNode.removeChild( this.node );
			}

			if ( this.children ) {
				this.children.teardown();
			}

			while ( this.attributes.length ) {
				this.attributes.pop().teardown();
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Attribute
	Attribute = function ( options ) {

		var name, value, colonIndex, namespacePrefix, namespace, ancestor;

		name = options.name;
		value = options.value;

		this.parent = options.parent; // the element this belongs to

		// are we dealing with a namespaced attribute, e.g. xlink:href?
		colonIndex = name.indexOf( ':' );
		if ( colonIndex !== -1 ) {

			// looks like we are, yes...
			namespacePrefix = name.substr( 0, colonIndex );

			// ...unless it's a namespace *declaration*
			if ( namespacePrefix === 'xmlns' ) {
				namespace = null;
			}

			else {

				// we need to find an ancestor element that defines this prefix
				ancestor = options.parentNode;

				// continue searching until there's nowhere further to go, or we've found the declaration
				while ( ancestor && !namespace ) {
					namespace = ancestor.getAttribute( 'xmlns:' + namespacePrefix );

					// continue searching possible ancestors
					ancestor = ancestor.parentNode || options.parent.parentFragment.parent.node || options.parent.parentFragment.parent.parentNode;
				}
			}

			// if we've found a namespace, make a note of it
			if ( namespace ) {
				this.namespace = namespace;
			}
		}

		// if it's just a straight key-value pair, with no mustache shenanigans, set the attribute accordingly
		if ( typeof value === 'string' ) {
			
			if ( namespace ) {
				options.parentNode.setAttributeNS( namespace, name.replace( namespacePrefix + ':', '' ), value );
			} else {
				options.parentNode.setAttribute( name, value );
			}
			
			return;
		}

		// otherwise we need to do some work
		this.parentNode = options.parentNode;
		this.name = name;

		this.children = [];

		// share parentFragment with parent element
		this.parentFragment = this.parent.parentFragment;

		this.fragment = new A.TextFragment({
			model:        value,
			root:    options.root,
			parent:        this,
			contextStack: options.contextStack
		});

		// manually trigger first update
		this.ready = true;
		this.update();
	};

	Attribute.prototype = {
		teardown: function () {
			// ignore non-dynamic attributes
			if ( !this.children ) {
				return;
			}

			while ( this.children.length ) {
				this.children.pop().teardown();
			}
		},

		bubble: function () {
			this.update();
		},

		update: function () {
			var prevValue = this.value;

			if ( !this.ready ) {
				return; // avoid items bubbling to the surface when we're still initialising
			}
			
			this.value = this.fragment.toString();

			if ( this.value !== prevValue ) {
				if ( this.namespace ) {
					this.parentNode.setAttributeNS( this.namespace, this.name, this.value );
				} else {
					this.parentNode.setAttribute( this.name, this.value );
				}
			}
		}
	};





	// Interpolator
	Interpolator = function ( options ) {
		// extend Mustache
		A._Mustache.call( this, options );
	};

	Interpolator.prototype = {
		initialize: function () {
			this.node = doc.createTextNode( '' );
			this.parentNode.insertBefore( this.node, this.anchor || null );
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}

			if ( elContains( this.root.el, this.node ) ) {
				this.parentNode.removeChild( this.node );
			}
		},

		update: function ( text ) {
			if ( text !== this.text ) {
				this.text = text;
				this.node.data = text;
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Triple
	Triple = function ( options ) {
		A._Mustache.call( this, options );
	};

	Triple.prototype = {
		initialize: function () {
			this.nodes = [];
		},

		teardown: function () {

			// remove child nodes from DOM
			if ( elContains( this.root.el, this.parentNode ) ) {
				while ( this.nodes.length ) {
					this.parentNode.removeChild( this.nodes.pop() );
				}
			}

			// kill observer(s)
			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		firstNode: function () {
			if ( this.nodes[0] ) {
				return this.nodes[0];
			}

			return this.parentFragment.findNextNode( this );
		},

		update: function ( html ) {
			var anchor;

			if ( html === this.html ) {
				return;
			}

			this.html = html;
			
			// remove existing nodes
			while ( this.nodes.length ) {
				this.parentNode.removeChild( this.nodes.pop() );
			}

			anchor = this.anchor || this.parentFragment.findNextNode( this );

			// get new nodes
			this.nodes = insertHtml( html, this.parentNode, anchor );
		}
	};



	// Section
	Section = function ( options ) {
		A._Mustache.call( this, options );
	};

	Section.prototype = {
		initialize: function () {
			this.fragments = [];
			this.length = 0; // number of times this section is rendered
		},

		teardown: function () {
			this.unrender();

			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		firstNode: function () {
			if ( this.fragments[0] ) {
				return this.fragments[0].firstNode();
			}

			return this.parentFragment.findNextNode( this );
		},

		findNextNode: function ( fragment ) {
			if ( this.fragments[ fragment.index + 1 ] ) {
				return this.fragments[ fragment.index + 1 ].firstNode();
			}

			return this.parentFragment.findNextNode( this );
		},

		unrender: function () {
			while ( this.fragments.length ) {
				this.fragments.shift().teardown();
			}
		},

		update: A._sectionUpdate,

		createFragment: function ( options ) {
			return new A.DomFragment( options );
		}
	};

}( Ractive ));

(function ( A ) {

	'use strict';

	var types,
		Text, Interpolator, Triple, Section;

	types = A.types;

	A.TextFragment = function ( options ) {
		A._Fragment.call( this, options );
	};

	A.TextFragment.prototype = {
		init: function () {
			this.value = this.items.join('');
		},

		createItem: function ( options ) {
			if ( typeof options.model === 'string' ) {
				return new Text( options.model );
			}

			switch ( options.model.type ) {
				case types.INTERPOLATOR: return new Interpolator( options );
				case types.TRIPLE: return new Triple( options );
				case types.SECTION: return new Section( options );

				default: throw 'Something went wrong in a rather interesting way';
			}
		},


		bubble: function () {
			this.value = this.items.join( '' );
			this.parent.bubble();
		},

		teardown: function () {
			var numItems, i;

			numItems = this.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				this.items[i].teardown();
			}
		},

		toString: function () {
			// TODO refactor this... value should already have been calculated? or maybe not. Top-level items skip the fragment and bubble straight to the attribute...
			// argh, it's confusing me
			return this.items.join( '' );
		}
	};



	// Plain text
	Text = function ( text ) {
		this.text = text;
	};

	Text.prototype = {
		toString: function () {
			return this.text;
		},

		teardown: function () {} // no-op
	};


	// Mustaches

	// Interpolator or Triple
	Interpolator = function ( options ) {
		A._Mustache.call( this, options );
	};

	Interpolator.prototype = {
		update: function ( value ) {
			this.value = value;
			this.parent.bubble();
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		toString: function () {
			return ( this.value === undefined ? '' : this.value );
		}
	};

	// Triples are the same as Interpolators in this context
	Triple = Interpolator;


	// Section
	Section = function ( options ) {
		A._Mustache.call( this, options );
	};

	Section.prototype = {
		initialize: function () {
			this.fragments = [];
			this.length = 0;
		},

		teardown: function () {
			this.unrender();

			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		unrender: function () {
			while ( this.fragments.length ) {
				this.fragments.shift().teardown();
			}
			this.length = 0;
		},

		bubble: function () {
			this.value = this.fragments.join( '' );
			this.parent.bubble();
		},

		update: function ( value ) {
			A._sectionUpdate.call( this, value );
		},

		createFragment: function ( options ) {
			return new A.TextFragment( options );
		},

		postUpdate: function () {
			this.value = this.fragments.join( '' );
			this.parent.bubble();
		},

		toString: function () {
			return this.fragments.join( '' );
			//return ( this.value === undefined ? '' : this.value );
		}
	};

}( Ractive ));
(function ( A ) {

	'use strict';

	A.extend = function ( childProps ) {

		var Parent, Child, key;

		Parent = this;

		Child = function () {
			A.apply( this, arguments );

			if ( this.init ) {
				this.init.apply( this, arguments );
			}
		};

		// extend child with parent methods
		for ( key in Parent.prototype ) {
			if ( Parent.prototype.hasOwnProperty( key ) ) {
				Child.prototype[ key ] = Parent.prototype[ key ];
			}
		}

		// extend child with specified methods, as long as they don't override Ractive.prototype methods
		for ( key in childProps ) {
			if ( childProps.hasOwnProperty( key ) ) {
				if ( A.prototype.hasOwnProperty( key ) ) {
					throw new Error( 'Cannot override "' + key + '" method or property of Ractive prototype' );
				}

				Child.prototype[ key ] = childProps[ key ];
			}
		}

		Child.extend = Parent.extend;

		return Child;
	};

}( Ractive ));
(function ( A ) {

	'use strict';

	var wrapMethods;

	A.modifyArray = function ( array, keypath, viewmodel ) {

		var viewmodels, keypathsByIndex, viewmodelIndex, keypaths;

		if ( !array._ractive ) {
			array._ractive = {
				viewmodels: [ viewmodel ],
				keypathsByIndex: [ [ keypath ] ]
			};

			wrapMethods( array );
		}

		else {
			viewmodels = array._ractive.viewmodels;
			keypathsByIndex = array._ractive.keypathsByIndex;

			// see if this viewmodel is currently associated with this array
			viewmodelIndex = viewmodels.indexOf( viewmodel );

			// if not, associate it
			if ( viewmodelIndex === -1 ) {
				viewmodelIndex = viewmodels.length;
				viewmodels[ viewmodelIndex ] = viewmodel;
			}

			// find keypaths that reference this array, on this viewmodel
			keypaths = keypathsByIndex[ viewmodelIndex ];

			// if the current keypath isn't among them, add it
			if ( keypaths.indexOf( keypath ) === -1 ) {
				keypaths[ keypaths.length ] = keypath;
			}
		}

	};

	wrapMethods = function ( array ) {
		var notifyDependents = function ( array ) {
			var viewmodels, keypathsByIndex;

			viewmodels = array._ractive.viewmodels;
			keypathsByIndex = array._ractive.keypathsByIndex;

			viewmodels.forEach( function ( viewmodel, i ) {
				var keypaths = keypathsByIndex[i];

				keypaths.forEach( function ( keypath ) {
					viewmodel.set( keypath, array );
				});
			});
		};

		[ 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift' ].forEach( function ( method ) {
			array[ method ] = function () {
				var result = Array.prototype[ method ].apply( this, arguments );
				notifyDependents( array );

				return result;
			};
		});
	};

}( Ractive ));
(function ( A ) {
	
	'use strict';

	// --------------------------------------------------
	// easing.js v0.5.4
	// Generic set of easing functions with AMD support
	// https://github.com/danro/easing-js
	// This code may be freely distributed under the MIT license
	// http://danro.mit-license.org/
	// --------------------------------------------------
	// All functions adapted from Thomas Fuchs & Jeremy Kahn
	// Easing Equations (c) 2003 Robert Penner, BSD license
	// https://raw.github.com/danro/easing-js/master/LICENSE
	// --------------------------------------------------
	A.easing = {
		easeInQuad: function(pos) {
			return Math.pow(pos, 2);
		},

		easeOutQuad: function(pos) {
			return -(Math.pow((pos-1), 2) -1);
		},

		easeInOutQuad: function(pos) {
			if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,2);
			return -0.5 * ((pos-=2)*pos - 2);
		},

		easeInCubic: function(pos) {
			return Math.pow(pos, 3);
		},

		easeOutCubic: function(pos) {
			return (Math.pow((pos-1), 3) +1);
		},

		easeInOutCubic: function(pos) {
			if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,3);
			return 0.5 * (Math.pow((pos-2),3) + 2);
		},

		easeInQuart: function(pos) {
			return Math.pow(pos, 4);
		},

		easeOutQuart: function(pos) {
			return -(Math.pow((pos-1), 4) -1);
		},

		easeInOutQuart: function(pos) {
			if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,4);
			return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
		},

		easeInQuint: function(pos) {
			return Math.pow(pos, 5);
		},

		easeOutQuint: function(pos) {
			return (Math.pow((pos-1), 5) +1);
		},

		easeInOutQuint: function(pos) {
			if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,5);
			return 0.5 * (Math.pow((pos-2),5) + 2);
		},

		easeInSine: function(pos) {
			return -Math.cos(pos * (Math.PI/2)) + 1;
		},

		easeOutSine: function(pos) {
			return Math.sin(pos * (Math.PI/2));
		},

		easeInOutSine: function(pos) {
			return (-0.5 * (Math.cos(Math.PI*pos) -1));
		},

		easeInExpo: function(pos) {
			return (pos===0) ? 0 : Math.pow(2, 10 * (pos - 1));
		},

		easeOutExpo: function(pos) {
			return (pos===1) ? 1 : -Math.pow(2, -10 * pos) + 1;
		},

		easeInOutExpo: function(pos) {
			if(pos===0) return 0;
			if(pos===1) return 1;
			if((pos/=0.5) < 1) return 0.5 * Math.pow(2,10 * (pos-1));
			return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
		},

		easeInCirc: function(pos) {
			return -(Math.sqrt(1 - (pos*pos)) - 1);
		},

		easeOutCirc: function(pos) {
			return Math.sqrt(1 - Math.pow((pos-1), 2));
		},

		easeInOutCirc: function(pos) {
			if((pos/=0.5) < 1) return -0.5 * (Math.sqrt(1 - pos*pos) - 1);
			return 0.5 * (Math.sqrt(1 - (pos-=2)*pos) + 1);
		},

		easeOutBounce: function(pos) {
			if ((pos) < (1/2.75)) {
				return (7.5625*pos*pos);
			} else if (pos < (2/2.75)) {
				return (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
			} else if (pos < (2.5/2.75)) {
				return (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
			} else {
				return (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
			}
		},

		easeInBack: function(pos) {
			var s = 1.70158;
			return (pos)*pos*((s+1)*pos - s);
		},

		easeOutBack: function(pos) {
			var s = 1.70158;
			return (pos=pos-1)*pos*((s+1)*pos + s) + 1;
		},

		easeInOutBack: function(pos) {
			var s = 1.70158;
			if((pos/=0.5) < 1) return 0.5*(pos*pos*(((s*=(1.525))+1)*pos -s));
			return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos +s) +2);
		},

		elastic: function(pos) {
			return -1 * Math.pow(4,-8*pos) * Math.sin((pos*6-1)*(2*Math.PI)/2) + 1;
		},

		swingFromTo: function(pos) {
			var s = 1.70158;
			return ((pos/=0.5) < 1) ? 0.5*(pos*pos*(((s*=(1.525))+1)*pos - s)) :
			0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos + s) + 2);
		},

		swingFrom: function(pos) {
			var s = 1.70158;
			return pos*pos*((s+1)*pos - s);
		},

		swingTo: function(pos) {
			var s = 1.70158;
			return (pos-=1)*pos*((s+1)*pos + s) + 1;
		},

		bounce: function(pos) {
			if (pos < (1/2.75)) {
				return (7.5625*pos*pos);
			} else if (pos < (2/2.75)) {
				return (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
			} else if (pos < (2.5/2.75)) {
				return (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
			} else {
				return (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
			}
		},

		bouncePast: function(pos) {
			if (pos < (1/2.75)) {
				return (7.5625*pos*pos);
			} else if (pos < (2/2.75)) {
				return 2 - (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
			} else if (pos < (2.5/2.75)) {
				return 2 - (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
			} else {
				return 2 - (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
			}
		},

		easeFromTo: function(pos) {
			if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,4);
			return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
		},

		easeFrom: function(pos) {
			return Math.pow(pos,4);
		},

		easeTo: function(pos) {
			return Math.pow(pos,0.25);
		}
	};

}( Ractive ));
(function ( A ) {

	'use strict';

	var Animation, animationCollection, global;

	global = ( typeof window !== 'undefined' ? window : {} );

	// https://gist.github.com/paulirish/1579671
	(function( vendors, lastTime, window ) {
		
		var x;

		for ( x = 0; x < vendors.length && !global.requestAnimationFrame; ++x ) {
			global.requestAnimationFrame = global[vendors[x]+'RequestAnimationFrame'];
			global.cancelAnimationFrame = global[vendors[x]+'CancelAnimationFrame'] || global[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if ( !global.requestAnimationFrame ) {
			global.requestAnimationFrame = function(callback) {
				var currTime, timeToCall, id;
				
				currTime = Date.now();
				timeToCall = Math.max( 0, 16 - (currTime - lastTime ) );
				id = global.setTimeout( function() { callback(currTime + timeToCall); }, timeToCall );
				
				lastTime = currTime + timeToCall;
				return id;
			};
		}

		if ( !global.cancelAnimationFrame ) {
			global.cancelAnimationFrame = function( id ) {
				global.clearTimeout( id );
			};
		}
	}( ['ms', 'moz', 'webkit', 'o'], 0, global ));



	Animation = function ( options ) {
		var key;

		this.startTime = Date.now();

		// from and to
		for ( key in options ) {
			if ( options.hasOwnProperty( key ) ) {
				this[ key ] = options[ key ];
			}
		}

		this.delta = this.to - this.from;
		this.running = true;
	};

	animationCollection = {
		animations: [],

		tick: function () {
			var i, animation;

			for ( i=0; i<this.animations.length; i+=1 ) {
				animation = this.animations[i];

				if ( !animation.tick() ) {
					// animation is complete, remove it from the stack, and decrement i so we don't miss one
					this.animations.splice( i--, 1 );
				}
			}

			if ( this.animations.length ) {
				global.requestAnimationFrame( this.boundTick );
			} else {
				this.running = false;
			}
		},

		// bind method to animationCollection
		boundTick: function () {
			animationCollection.tick();
		},

		push: function ( animation ) {
			this.animations[ this.animations.length ] = animation;

			if ( !this.running ) {
				this.running = true;
				this.tick();
			}
		}
	};

	Animation.prototype = {
		tick: function () {
			var elapsed, t, value, timeNow;

			if ( this.running ) {
				timeNow = Date.now();
				elapsed = timeNow - this.startTime;

				if ( elapsed >= this.duration ) {
					this.viewmodel.set( this.keypath, this.to );

					if ( this.complete ) {
						this.complete( 1 );
					}

					this.running = false;
					return false;
				}

				t = this.easing ? this.easing ( elapsed / this.duration ) : ( elapsed / this.duration );
				value = this.from + ( t * this.delta );

				this.viewmodel.set( this.keypath, value );

				if ( this.step ) {
					this.step( t, value );
				}

				return true;
			}

			return false;
		},

		stop: function () {
			this.running = false;
		}
	};


	A.prototype.animate = function ( keypath, to, options ) {
		var easing, from, duration, animation, i;

		// check from and to are both numeric
		to = parseFloat( to );
		if ( isNaN( to ) ) {
			throw 'Cannot animate to a non-numeric property';
		}

		from = parseFloat( this.get( keypath ) );
		if ( isNaN( to ) ) {
			throw 'Cannot animate from a non-numeric property';
		}

		// cancel any existing animation
		i = animationCollection.animations.length;
		while ( i-- ) {
			if ( animationCollection.animations[ i ].keypath === keypath ) {
				animationCollection.animations[ i ].stop();
			}
		}

		// easing function
		if ( options && options.easing ) {
			if ( typeof options.easing === 'function' ) {
				easing = options.easing;
			}

			else {
				if ( this.easing && this.easing[ options.easing ] ) {
					// use instance easing function first
					easing = this.easing[ options.easing ];
				} else {
					// fallback to global easing functions
					easing = A.easing[ options.easing ];
				}
			}

			if ( typeof easing !== 'function' ) {
				easing = null;
			}
		}

		// duration
		duration = ( !options || options.duration === undefined ? 400 : options.duration );

		animation = new Animation({
			keypath: keypath,
			from: from,
			to: to,
			viewmodel: this.viewmodel,
			duration: duration,
			easing: easing
		});

		animationCollection.push( animation );
	};


}( Ractive ));

// export
if ( typeof module !== "undefined" && module.exports ) module.exports = Ractive // Common JS
else if ( typeof define === "function" && define.amd ) define( function () { return Ractive } ) // AMD
else { global.Ractive = Ractive }

}( this ));