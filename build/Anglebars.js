/*! Anglebars - v0.1.2 - 2013-01-26
* http://rich-harris.github.com/Anglebars/
* Copyright (c) 2013 Rich Harris; Licensed WTFPL */

/*jslint eqeq: true, plusplus: true */
/*global document, HTMLElement */

'use strict';



(function ( global ) {

// Create our global variable, which serves as both constructor function and namespace
var Anglebars = function ( options ) {

	// Options
	// -------

	options = options || {};

	// `el` **string | HTMLElement** *optional*  
	// The target element to render to. If omitted, nothing will be rendered
	// until `.render()` is called.
	if ( 'el' in options ) {
		this.el = Anglebars.utils.getEl( options.el );
	}

	// `compiled` **object** *optional*  
	// A precompiled template, generated with the static `Anglebars.compile`
	// method.
	if ( 'compiled' in options ) {
		this.compiled = options.compiled;
	}

	// `template` **string** *optional*  
	// A string containing valid HTML (albeit with mustaches), to be used in
	// the absence of a precompiled template (e.g. during initial development)
	if ( 'template' in options ) {
		this.template = options.template;
	}

	// `partials` **object** *optional*  
	// A hash containing strings representing partial templates
	if ( 'partials' in options ) {
		this.partials = options.partials;
	}

	// `compiledPartials` **object** *optional*  
	// A hash containing compiled partials
	this.compiledPartials = ( 'compiledPartials' in options ? options.compiledPartials : {} );

	// `data` **object | Anglebars.ViewModel** *optional*  
	// An object or an `Anglebars.ViewModel` instance containing the data with
	// which to populate the template. Passing in an existing `Anglebars.ViewModel`
	// instance allows separate Anglebars instances to share a single view model
	this.viewmodel = ( options.data instanceof Anglebars.ViewModel ? options.data : new Anglebars.ViewModel( options.data ) );

	// `formatters` **object** *optional*  
	// An object containing mustache formatter functions
	this.formatters = ( 'formatters' in options ? options.formatters : {} );

	// `preserveWhitespace` **boolean** *optional*  
	// Whether or not to preserve whitespace in the template (e.g. newlines
	// between elements), which is usually ignored by the browser. Defaults
	// to `false`
	this.preserveWhitespace = ( 'preserveWhitespace' in options ? options.preserveWhitespace : false );

	// `replaceSrcAttributes` **boolean** *optional*  
	// Whether to replace src attributes with data-anglebars-src during template
	// compilation (prevents browser requesting non-existent resources).
	// Defaults to `true`
	this.replaceSrcAttributes = ( 'replaceSrcAttributes' in options ? options.replaceSrcAttributes : true );

	// `namespace` **string** *optional*  
	// What namespace to treat as the parent namespace when compiling. This will
	// be guessed from the container element, but can be overridden here
	this.namespace = ( options.namespace ? options.namespace : ( this.el && this.el.namespaceURI !== 'http://www.w3.org/1999/xhtml' ? this.el.namespaceURI : null ) );

	// `async` **boolean** *optional*  
	// Whether to render asynchronously. If `true`, Anglebars will render as much
	// as possible within the time allowed by `maxBatch` (below), before yielding
	// the UI thread until the next available animation frame. Rendering will take
	// longer, but this will prevent the browser from freezing up while it happens.
	// If a `callback` is specified, it will be called when rendering is complete.
	this.async = ( 'async' in options ? options.async : false );

	// `maxBatch` **number** *optional*  
	// Maximum time, in milliseconds, to continue rendering each batch of nodes
	// before yielding the UI thread. Defaults to 50. Longer values will result in
	// a quicker render, but may result in slight 'choppiness'.
	this.maxBatch = ( 'maxBatch' in options ? options.maxBatch : 50 );

	// `append` **boolean** *optional*  
	// Whether to append to `this.el`, rather than overwriting its contents. Defaults
	// to `false`
	this.append = ( 'append' in options ? options.append : false );

	// `twoway` **boolean** *optional*
	// Whether to automate two-way data binding. Defaults to `true`
	this.twoway = ( 'twoway' in options ? options.twoway : true );


	// Initialization
	// --------------

	// If we were given uncompiled partials, compile them
	if ( this.partials ) {
		for ( var key in this.partials ) {
			if ( this.partials.hasOwnProperty( key ) ) {
				this.compiledPartials[ key ] = Anglebars.compile( this.partials[ key ], {
					preserveWhitespace: this.preserveWhitespace,
					replaceSrcAttributes: this.replaceSrcAttributes
				});
			}
		}
	}

	// If we were given a template, compile it
	if ( !this.compiled && this.template ) {
		this.compiled = Anglebars.compile( this.template, {
			preserveWhitespace: this.preserveWhitespace,
			replaceSrcAttributes: this.replaceSrcAttributes,
			namespace: this.namespace,
			partials: this.compiledPartials
		});
	}

	// Render
	if ( this.compiled && this.el ) {
		this.render({ el: this.el, callback: options.callback, append: this.append });
	}
};



// Prototype methods
// =================
Anglebars.prototype = {

	// Add an item to the async render queue
	queue: function ( items ) {
		this._queue = items.concat( this._queue || [] );

		// If the queue is not currently being dispatched, dispatch it
		if ( !this._dispatchingQueue ) {
			this.dispatchQueue();
		}
	},

	// iterate through queue, render as many items as possible before we need to
	// yield the UI thread
	dispatchQueue: function () {
		var self = this, batch, max;

		max = this.maxBatch; // defaults to 50 milliseconds before yielding

		batch = function () {
			var startTime = +new Date(), next;

			// We can't cache self._queue.length because creating new views is likely to
			// modify it
			while ( self._queue.length && ( new Date() - startTime < max ) ) {
				next = self._queue.shift();

				next.parentFragment.items[ next.index ] = Anglebars.DomViews.create( next );
			}

			// If we ran out of time before completing the queue, kick off a fresh batch
			// at the next opportunity
			if ( self._queue.length ) {
				Anglebars.utils.wait( batch );
			}

			// Otherwise, mark queue as dispatched and execute any callback we have
			else {
				self._dispatchingQueue = false;

				if ( self.callback ) {
					self.callback();
					delete self.callback;
				}

				// Oh, and disable async for further updates (TODO - this is messy)
				self.async = false;
			}
		};

		// Do the first batch
		this._dispatchingQueue = true;
		Anglebars.utils.wait( batch );
	},




	// Render instance to element specified here or at initialization
	render: function ( options ) {
		var el = ( options.el ? Anglebars.utils.getEl( options.el ) : this.el );

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
		this.rendered = new Anglebars.DomViews.Fragment({
			model: this.compiled,
			anglebars: this,
			parentNode: el
		});

		// If we were given a callback, but we're not in async mode, execute immediately
		if ( !this.async && options.callback ) {
			options.callback();
		}
	},

	// Teardown. This goes through the root fragment and all its children, removing observers
	// and generally cleaning up after itself
	teardown: function () {
		this.rendered.teardown();
	},

	// Proxies for viewmodel `set`, `get`, `update`, `observe` and `unobserve` methods
	set: function () {
		var oldDisplay = this.el.style.display;

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

	observe: function () {
		return this.viewmodel.observe.apply( this.viewmodel, arguments );
	},

	unobserve: function () {
		this.viewmodel.unobserve.apply( this.viewmodel, arguments );
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
			fn = this.formatters[ name ] || Anglebars.formatters[ name ];

			if ( fn ) {
				value = fn.apply( this, [ value ].concat( args ) );
			}
		}

		return value;
	}
};


// Static method to compile a template string
Anglebars.compile = function ( template, options ) {
	var nodes, tokens, fragmentStub, compiled, delimiters, tripleDelimiters, utils = Anglebars.utils;

	options = options || {};

	// If delimiters are specified use them, otherwise reset to defaults
	Anglebars.delimiters = options.delimiters || [ '{{', '}}' ];
	Anglebars.tripleDelimiters = options.tripleDelimiters || [ '{{{', '}}}' ];

	tokens = utils.tokenize( template );
	fragmentStub = utils.getFragmentStubFromTokens( tokens );
	compiled = fragmentStub.toJson();

	return compiled;
};

// Cached regexes
Anglebars.patterns = {
	formatter: /([a-zA-Z_$][a-zA-Z_$0-9]*)(\[[^\]]*\])?/,

	// for template preprocessor
	preprocessorTypes: /section|comment|delimiterChange/,
	standalonePre: /(?:\r)?\n[ \t]*$/,
	standalonePost: /^[ \t]*(\r)?\n/,
	standalonePreStrip: /[ \t]+$/,

	arrayPointer: /\[([0-9]+)\]/
};


// Mustache types
Anglebars.types = {
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


// Default formatters
Anglebars.formatters = {
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
(function ( A ) {

	'use strict';

	var types = A.types;

	var utils = A.utils = {
		// convert HTML to an array of DOM nodes
		/*getNodeArrayFromHtml: function ( html, replaceSrcAttributes ) {

			var temp, i, numNodes, nodes = [], attrs, tags, pattern;

			html = '' + html; // coerce non-string values to string (i.e. in triples)

			// TODO work out the most efficient way to do this

			// replace src attribute with data-anglebars-src
			if ( replaceSrcAttributes ) {
				attrs = [ 'src', 'poster' ];

				i = attrs.length;
				while ( i-- ) {
					pattern = new RegExp( '(<[^>]+\\s)(' + attrs[i] + '=)', 'g' );
					html = html.replace( pattern, '$1data-anglebars-' + attrs[i] + '=' );
				}
			}

			// replace table tags with <div data-anglebars-elementname='table'></div> -
			// this is because the way browsers parse table HTML is F**CKING MENTAL
			var replaceFunkyTags = true; // TODO!
			if ( replaceFunkyTags ) {
				tags = [ 'table', 'thead', 'tbody', 'tr', 'th', 'td' ];

				i = tags.length;
				while ( i-- ) {
					pattern = new RegExp( '<(' + tags[i] + ')(\\s|>)', 'gi' );
					html = html.replace( pattern, '<div data-anglebars-elementname="$1"$2' );

					pattern = new RegExp( '<\\/' + tags[i] + '>', 'gi' );
					html = html.replace( pattern, '</div>' );
				}
			}

			temp = document.createElement( 'div' );
			temp.innerHTML = html;

			// create array from node list, as node lists have some undesirable properties
			nodes = [];
			i = temp.childNodes.length;
			while ( i-- ) {
				nodes[i] = temp.childNodes[i];
			}

			return nodes;
		},*/


		// Returns the specified DOM node
		getEl: function ( input ) {
			var output;

			if ( !input ) {
				throw new Error( 'No container element specified' );
			}

			// We already have a DOM node - no work to do
			if ( input.tagName ) {
				return input;
			}

			// Get node from string
			if ( typeof input === 'string' ) {
				output = document.getElementById( input );

				if ( output.tagName ) {
					return output;
				}
			}

			throw new Error( 'Could not find container element' );
		},


		// Split keypath ('foo.bar.baz[0]') into keys (['foo', 'bar', 'baz', 0])
		splitKeypath: function ( keypath ) {
			var firstPass, secondPass = [], i;

			// Start by splitting on periods
			firstPass = keypath.split( '.' );

			// Then see if any keys use array notation instead of dot notation
			for ( i=0; i<firstPass.length; i+=1 ) {
				secondPass = secondPass.concat( utils.parseArrayNotation( firstPass[i] ) );
			}

			return secondPass;
		},

		// Split key with array notation ('baz[0]') into identifier and array pointer(s) (['baz', 0])
		parseArrayNotation: function ( key ) {
			var index, arrayPointers, pattern, match, result;

			index = key.indexOf( '[' );

			if ( index === -1 ) {
				return key;
			}

			result = [ key.substr( 0, index ) ];
			arrayPointers = key.substring( index );

			pattern = A.patterns.arrayPointer;

			while ( arrayPointers.length ) {
				match = pattern.exec( arrayPointers );

				if ( !match ) {
					return result;
				}

				result[ result.length ] = +match[1];
				arrayPointers = arrayPointers.substring( match[0].length );
			}

			return result;
		},



		// CAUTION! HERE BE REGEXES
		escape: function ( str ) {
			var theSpecials = /[\[\]\(\)\{\}\^\$\*\+\?\.\|]/g;

			// escaped characters need an extra backslash
			return str.replace( theSpecials, '\\$&' );
		},

		/*compileMustachePattern: function () {
			var openDelim = this.escape( A.delimiters[0] ),
				closeDelim = this.escape( A.delimiters[1] ),
				openTrDelim = this.escape( A.tripleDelimiters[0] ),
				closeTrDelim = this.escape( A.tripleDelimiters[1] );

			A.patterns.mustache = new RegExp( '' +

			// opening delimiters - triple (1) or regular (2)
			'(?:(' + openTrDelim + ')|(' + openDelim + '))' +

			// EITHER:
			'(?:(?:' +

				// delimiter change (3/6) - the new opening (4) and closing (5) delimiters
				'(=)\\s*([^\\s]+)\\s+([^\\s]+)\\s*(=)' +

				// closing delimiters - triple (7) or regular (8)
				'(?:(' + closeTrDelim + ')|(' + closeDelim + '))' +

			// OR:
			')|(?:' +

				// sections (9): opening normal, opening inverted, closing
				'(#|\\^|\\/)?' +

				// partials (10)
				'(\\>)?' +

				// unescaper (11) (not sure what relevance this has...?)
				'(&)?' +

				// comment (12)
				'(!)?' +



				// optional whitespace
				'\\s*' +

				// mustache formula (13)
				'([\\s\\S]+?)' +

				// more optional whitespace
				'\\s*' +

				// closing delimiters - triple (14) or regular (15)
				'(?:(' + closeTrDelim + ')|(' + closeDelim + '))' +

			'))', 'g' );
		},*/


		stripHtmlComments: function ( str ) {
			var commentStart, commentEnd, processed;

			processed = '';

			while ( str.length ) {
				commentStart = str.indexOf( '<!--' );
				commentEnd = str.indexOf( '-->' );

				// no comments? great
				if ( commentStart === -1 && commentEnd === -1 ) {
					processed += str;
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

				processed += str.substr( 0, commentStart );
				str = str.substring( commentEnd + 3 );
			}

			return processed;
		},


		// collapse standalones (i.e. mustaches that sit on a line by themselves) and remove comments
		/*preProcess: function ( str ) {
			var result = '', remaining = str, mustache, pre, post, preTest, postTest, typeTest, delimiters, tripleDelimiters, recompile;

			// make a note of current delimiters, we may need to reset them in a minute
			delimiters = A.delimiters.concat();
			tripleDelimiters = A.tripleDelimiters.concat();

			// patterns
			preTest = /(?:\r)?\n\s*$/;
			postTest = /^\s*(?:\r)?\n/;

			while ( remaining.length ) {
				mustache = utils.findMustache( remaining );


				// if there are no more mustaches, add the remaining text and be done
				if ( !mustache ) {
					result += remaining;
					break;
				}

				// if we've got a section, comment, or delimiter change mustache...
				if ( mustache.type === types.SECTION || mustache.type === types.COMMENT || mustache.type === types.DELIMCHANGE ) {
					pre = remaining.substr( 0, mustache.start ); // before the mustache
					post = remaining.substring( mustache.end );  // after the mustache

					// if there is newline + (whitespace)? immediately before the mustache, and
					// (whitespace)? + newline immediately after, remove one of them
					if ( preTest.test( pre ) && postTest.test( post ) ) {
						pre = pre.replace( /(?:\r)?\n\s*$/, '' );
					}

					result += pre;

					// strip comments
					if ( mustache.type !== types.COMMENT ) {
						result += mustache[0];
					}

					remaining = post;
				}

				// otherwise carry on as normal
				else {
					result += remaining.substr( 0, mustache.end );
					remaining = remaining.substring( mustache.end );
				}
			}

			// reset delimiters if necessary
			if ( ( A.delimiters[0] !== delimiters[0] ) || ( A.delimiters[1] !== delimiters[1] ) ) {
				A.delimiters = delimiters;
				recompile = true;
			}

			if ( ( A.tripleDelimiters[0] !== tripleDelimiters[0] ) || ( A.tripleDelimiters[1] !== tripleDelimiters[1] ) ) {
				A.tripleDelimiters = tripleDelimiters;
				recompile = true;
			}

			if ( recompile ) {
				utils.compileMustachePattern();
			}

			return result;
		},*/



		// find the first mustache in a string, and store some information about it. Returns an array
		// - the result of regex.exec() - with some additional properties
		/*findMustache: function ( text, startIndex ) {

			var match, split, mustache, formulaSplitter, i, formatters, formatterNameAndArgs, formatterPattern, formatter, newDelimiters;

			mustache = A.patterns.mustache;
			formulaSplitter = ' | ';
			formatterPattern = A.patterns.formatter;

			match = utils.findMatch( text, mustache, startIndex );

			if ( match ) {

				// first, see if we're dealing with a delimiter change
				if ( match[3] && match[6] ) {
					match.type = types.DELIMCHANGE;

					// triple or regular?
					if ( match[1] && match[7] ) {
						// triple delimiter change
						A.tripleDelimiters = [ match[4], match[5] ];
					} else {
						// triple delimiter change
						A.delimiters = [ match[4], match[5] ];
					}

					utils.compileMustachePattern();
				}

				else {
					match.formula = match[13];
					split = match.formula.split( formulaSplitter );
					match.partialKeypath = split.shift();

					// extract formatters
					formatters = [];

					for ( i=0; i<split.length; i+=1 ) {
						formatterNameAndArgs = formatterPattern.exec( split[i] );
						if ( formatterNameAndArgs ) {
							formatter = {
								name: formatterNameAndArgs[1]
							};

							if ( formatterNameAndArgs[2] ) {
								try {
									formatter.args = JSON.parse( formatterNameAndArgs[2] );
								} catch ( err ) {
									throw new Error( 'Illegal arguments for formatter \'' + formatter.name + '\': ' + formatterNameAndArgs[2] + ' (JSON.parse() failed)' );
								}
							}

							formatters.push( formatter );
						}
					}

					if ( formatters.length ) {
						match.formatters = formatters;
					}


					// figure out what type of mustache we're dealing with
					if ( match[9] ) {
						// mustache is a section
						match.type = types.SECTION;
						match.inverted = ( match[9] === '^' ? true : false );
						match.closing = ( match[9] === '/' ? true : false );
					}

					else if ( match[10] ) {
						match.type = types.PARTIAL;
					}

					else if ( match[1] ) {
						// left side is a triple - check right side is as well
						if ( !match[14] ) {
							return false;
						}

						match.type = types.TRIPLE;
					}

					else if ( match[12] ) {
						match.type = types.COMMENT;
					}

					else {
						match.type = types.INTERPOLATOR;
					}
				}

				match.isMustache = true;
				return match;
			}

			// if no mustache found, report failure
			return false;
		},*/


		// find the first match of a pattern within a string. Returns an array with start and end properties indicating where the match was found within the string
		/*findMatch: function ( text, pattern, startIndex ) {

			var match;

			// reset lastIndex
			if ( pattern.global ) {
				pattern.lastIndex = startIndex || 0;
			} else {
				throw new Error( 'You must pass findMatch() a regex with the global flag set' );
			}

			match = pattern.exec( text );

			if ( match ) {
				match.end = pattern.lastIndex;
				match.start = ( match.end - match[0].length );
				return match;
			}
		},*/


		/*getStubsFromNodes: function ( nodes ) {
			var i, numNodes, node, result = [], stubs;

			numNodes = nodes.length;
			for ( i=0; i<numNodes; i+=1 ) {
				node = nodes[i];

				if ( node.nodeType === 1 ) {
					result[ result.length ] = {
						type: types.ELEMENT,
						original: node
					};
				}

				else if ( node.nodeType === 3 ) {
					stubs = utils.expandText( node.data );
					if ( stubs ) {
						result = result.concat( stubs );
					}
				}
			}

			return result;
		},*/

		/*expandText: function ( text ) {
			var result = [], mustache, start, ws, pre, post, standalone, stubs;

			// see if there's a mustache involved here
			mustache = utils.findMustache( text );

			// delimiter changes are a special (and bloody awkward...) case
			while ( mustache.type === types.DELIMCHANGE ) {

				if ( mustache.start > 0 ) {
					result[ result.length ] = {
						type: types.TEXT,
						text: text.substr( 0, mustache.start )
					};
				}

				text = text.substring( mustache.end );
				mustache = utils.findMustache( text );
			}

			// if no mustaches, groovy - no work to do
			if ( !mustache ) {
				if ( text ) {
					return result.concat({
						type: types.TEXT,
						text: text
					});
				}

				return ( result.length ? result : false );
			}

			// otherwise, see if there is any text before the node
			standalone = true;
			ws = /\s*\n\s*$/;

			if ( mustache.start > 0 ) {
				pre = text.substr( 0, mustache.start );

				result[ result.length ] = {
					type: types.TEXT,
					text: pre
				};
			}

			// add the mustache
			result[ result.length ] = {
				type: types.MUSTACHE,
				mustache: mustache
			};

			if ( mustache.end < text.length ) {
				stubs = utils.expandText( text.substring( mustache.end ) );

				if ( stubs ) {
					result = result.concat( stubs );
				}
			}

			return result;
		},*/

		// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
		isArray: function ( obj ) {
			return Object.prototype.toString.call( obj ) === '[object Array]';
		},

		isObject: function ( obj ) {
			return ( Object.prototype.toString.call( obj ) === '[object Object]' ) && ( typeof obj !== 'function' );
		},


		insertHtml: function ( html, parent, anchor ) {
			var div, i, len, nodes = [];

			anchor = anchor || null;

			div = document.createElement( 'div' );
			div.innerHTML = html;

			len = div.childNodes.length;

			for ( i=0; i<len; i+=1 ) {
				nodes[i] = div.childNodes[i];
			}

			for ( i=0; i<len; i+=1 ) {
				parent.insertBefore( nodes[i], anchor );
			}

			return nodes;
		}

		/*compileStubs: function ( stubs, priority, preserveWhitespace ) {
			var compiled, next, processStub;

			compiled = [];

			processStub = function ( i ) {
				var whitespace, mustache, item, text, element, stub, sliceStart, sliceEnd, nesting, bit, partialKeypath, compiledStub;

				whitespace = /^\s*\n\r?\s*$/;

				stub = stubs[i];

				switch ( stub.type ) {
					case types.TEXT:
						if ( !preserveWhitespace ) {
							if ( whitespace.test( stub.text ) || stub.text === '' ) {
								return i+1; // don't bother keeping this if it only contains whitespace, unless that's what the user wants
							}
						}

						compiled[ compiled.length ] = stub;
						return i+1;

					case types.ELEMENT:
						compiled[ compiled.length ] = utils.processElementStub( stub, priority );
						return i+1;

					case types.MUSTACHE:

						partialKeypath = stub.mustache.partialKeypath;

						switch ( stub.mustache.type ) {
							case types.SECTION:

								i += 1;
								sliceStart = i; // first item in section
								nesting = 1;

								// find end
								while ( ( i < stubs.length ) && !sliceEnd ) {

									bit = stubs[i];

									if ( bit.type === types.MUSTACHE ) {
										if ( bit.mustache.type === types.SECTION && bit.mustache.partialKeypath === partialKeypath ) {
											if ( !bit.mustache.closing ) {
												nesting += 1;
											}

											else {
												nesting -= 1;
												if ( !nesting ) {
													sliceEnd = i;
												}
											}
										}
									}

									i += 1;
								}

								if ( !sliceEnd ) {
									throw new Error( 'Illegal section "' + partialKeypath + '"' );
								}

								compiledStub = {
									type: types.SECTION,
									partialKeypath: partialKeypath,
									inverted: stub.mustache.inverted,
									children: utils.compileStubs( stubs.slice( sliceStart, sliceEnd ), priority + 1, preserveWhitespace ),
									priority: priority
								};
								if ( stub.mustache.formatters ) {
									compiledStub.formatters = stub.mustache.formatters;
								}

								compiled[ compiled.length ] = compiledStub;
								return i;


							case types.TRIPLE:
								compiledStub = {
									type: types.TRIPLE,
									partialKeypath: stub.mustache.partialKeypath,
									priority: priority
								};
								if ( stub.mustache.formatters ) {
									compiledStub.formatters = stub.mustache.formatters;
								}

								compiled[ compiled.length ] = compiledStub;
								return i+1;


							case types.INTERPOLATOR:
								compiledStub = {
									type: types.INTERPOLATOR,
									partialKeypath: stub.mustache.partialKeypath,
									priority: priority
								};
								if ( stub.mustache.formatters ) {
									compiledStub.formatters = stub.mustache.formatters;
								}

								compiled[ compiled.length ] = compiledStub;
								return i+1;


							case types.PARTIAL:
								compiledStub = {
									type: types.PARTIAL,
									id: stub.mustache.partialKeypath,
									priority: priority
								};
								
								compiled[ compiled.length ] = compiledStub;
								return i+1;	

							default:
								if ( console && console.error ) { console.error( 'Bad mustache: ', stub.mustache ); }
								throw new Error( 'Error compiling template: Illegal mustache (' + stub.mustache[0] + ')' );
						}
						break;

					default:
						throw new Error( 'Error compiling template. Something *very weird* has happened' );
				}
			};

			next = 0;
			while ( next < stubs.length ) {
				next = processStub( next );
			}

			return compiled;
		},*/

		/*compileStubs: function ( stubs, priority, preserveWhitespace ) {
			var compiled, next, processStub;

			compiled = [];

			processStub = function ( i ) {
				var whitespace, mustache, item, text, element, stub, sliceStart, sliceEnd, nesting, bit, partialKeypath, compiledStub;

				whitespace = /^\s*\n\r?\s*$/;

				stub = stubs[i];

				switch ( stub.type ) {
					case types.TEXT:
						if ( !preserveWhitespace ) {
							if ( whitespace.test( stub.text ) || stub.text === '' ) {
								return i+1; // don't bother keeping this if it only contains whitespace, unless that's what the user wants
							}
						}

						compiled[ compiled.length ] = stub;
						return i+1;

					case types.ELEMENT:
						compiled[ compiled.length ] = utils.processElementStub( stub, priority );
						return i+1;

					case types.MUSTACHE:

						partialKeypath = stub.mustache.partialKeypath;

						switch ( stub.mustache.type ) {
							case types.SECTION:

								i += 1;
								sliceStart = i; // first item in section
								nesting = 1;

								// find end
								while ( ( i < stubs.length ) && !sliceEnd ) {

									bit = stubs[i];

									if ( bit.type === types.MUSTACHE ) {
										if ( bit.mustache.type === types.SECTION && bit.mustache.partialKeypath === partialKeypath ) {
											if ( !bit.mustache.closing ) {
												nesting += 1;
											}

											else {
												nesting -= 1;
												if ( !nesting ) {
													sliceEnd = i;
												}
											}
										}
									}

									i += 1;
								}

								if ( !sliceEnd ) {
									throw new Error( 'Illegal section "' + partialKeypath + '"' );
								}

								compiledStub = {
									type: types.SECTION,
									partialKeypath: partialKeypath,
									inverted: stub.mustache.inverted,
									children: utils.compileStubs( stubs.slice( sliceStart, sliceEnd ), priority + 1, preserveWhitespace ),
									priority: priority
								};
								if ( stub.mustache.formatters ) {
									compiledStub.formatters = stub.mustache.formatters;
								}

								compiled[ compiled.length ] = compiledStub;
								return i;


							case types.TRIPLE:
								compiledStub = {
									type: types.TRIPLE,
									partialKeypath: stub.mustache.partialKeypath,
									priority: priority
								};
								if ( stub.mustache.formatters ) {
									compiledStub.formatters = stub.mustache.formatters;
								}

								compiled[ compiled.length ] = compiledStub;
								return i+1;


							case types.INTERPOLATOR:
								compiledStub = {
									type: types.INTERPOLATOR,
									partialKeypath: stub.mustache.partialKeypath,
									priority: priority
								};
								if ( stub.mustache.formatters ) {
									compiledStub.formatters = stub.mustache.formatters;
								}

								compiled[ compiled.length ] = compiledStub;
								return i+1;


							case types.PARTIAL:
								compiledStub = {
									type: types.PARTIAL,
									id: stub.mustache.partialKeypath,
									priority: priority
								};
								
								compiled[ compiled.length ] = compiledStub;
								return i+1;	

							default:
								if ( console && console.error ) { console.error( 'Bad mustache: ', stub.mustache ); }
								throw new Error( 'Error compiling template: Illegal mustache (' + stub.mustache[0] + ')' );
						}
						break;

					default:
						throw new Error( 'Error compiling template. Something *very weird* has happened' );
				}
			};

			next = 0;
			while ( next < stubs.length ) {
				next = processStub( next );
			}

			return compiled;
		},*/

		/*processElementStub: function ( stub, priority ) {
			var proxy, attributes, numAttributes, attribute, i, node;

			node = stub.original;

			proxy = {
				type: types.ELEMENT,
				tag: node.getAttribute( 'data-anglebars-elementname' ) || node.localName || node.tagName, // we need localName for SVG elements but tagName for Internet Exploder
				priority: priority
			};

			// attributes
			attributes = [];

			numAttributes = node.attributes.length;
			for ( i=0; i<numAttributes; i+=1 ) {
				attribute = node.attributes[i];

				if ( attributes.name === 'data-anglebars-elementname' ) {
					continue;
				}

				if ( attribute.name === 'xmlns' ) {
					proxy.namespace = attribute.value;
				}

				attributes[ attributes.length ] = utils.processAttribute( attribute.name, attribute.value, priority + 1 );
			}

			proxy.attributes = attributes;

			// get children
			proxy.children = utils.compileStubs( utils.getStubsFromNodes( node.childNodes ), priority + 1 );

			return proxy;
		},

		processAttribute: function ( name, value, priority ) {
			var attribute, stubs;

			stubs = utils.expandText( value );

			attribute = {
				name: name.replace( 'data-anglebars-', '' )
			};

			// no mustaches in this attribute - no extra work to be done
			if ( !utils.findMustache( value ) || !stubs ) {
				attribute.value = value;
				return attribute;
			}


			// mustaches present - attribute is dynamic
			attribute.isDynamic = true;
			attribute.priority = priority;
			attribute.components = utils.compileStubs( stubs, priority );


			return attribute;
		}*/
	};


	(function() {
		var vendors = ['ms', 'moz', 'webkit', 'o'], i, tryVendor;
		
		if ( window.requestAnimationFrame ) {
			utils.wait = function ( task ) {
				window.requestAnimationFrame( task );
			};
			return;
		}

		tryVendor = function ( i ) {
			if ( window[ vendors[i]+'RequestAnimationFrame' ] ) {
				utils.wait = function ( task ) {
					window[ vendors[i]+'RequestAnimationFrame' ]( task );
				};
				return;
			}
		};

		for ( i=0; i<vendors.length; i+=1 ) {
			tryVendor( i );
		}

		utils.wait = function( task ) {
			setTimeout( task, 16 );
		};
	}());

}( Anglebars ));
(function ( A ) {
	
	'use strict';

	var utils,
		types,
		stripHtmlComments,
		getTokens,
		getTree,
		whitespace,
		alphanumerics,
		tokenize,

		TokenStream,
		MustacheBuffer,
		
		TextToken,
		MustacheToken,
		TripleToken,
		TagToken,
		AttributeValueToken,

		mustacheTypes;


	utils = A.utils;
	types = A.types;

	stripHtmlComments = function ( str ) {
		var commentStart, commentEnd, processed;

		processed = '';

		while ( str.length ) {
			commentStart = str.indexOf( '<!--' );
			commentEnd = str.indexOf( '-->' );

			// no comments? great
			if ( commentStart === -1 && commentEnd === -1 ) {
				processed += str;
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

			processed += str.substr( 0, commentStart );
			str = str.substring( commentEnd + 3 );
		}

		return processed;
	};


	whitespace = /\s/;
	alphanumerics = /[0-9a-zA-Z]/;

	


	

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
			var mustache, triple, token;

			// store mustache and triple opening delimiters
			mustache = A.delimiters[0];
			triple = A.tripleDelimiters[0];

			// out of mustache and triple opening delimiters, try to match longest first.
			// if they're the same length then only one will match anyway, unless some
			// plonker has set them to the same thing (which should probably throw an error)
			if ( triple.length > mustache.length ) {

				// triple first
				if ( this.value.indexOf( triple ) === 0 ) {
					token = new TripleToken();
				}

				// mustache first
				else if ( this.value.indexOf( mustache ) === 0 ) {
					token = new MustacheToken();
				}
			}

			else {

				// mustache first
				if ( this.value.indexOf( mustache ) === 0 ) {
					token = new MustacheToken();
				}

				// triple first
				if ( this.value.indexOf( triple ) === 0 ) {
					token = new TripleToken();
				}
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

		// merge: function ( token ) {
		// 	this.value += token.value;
		// },

		seal: function () {
			this.sealed = true;
		}
	};


	mustacheTypes = {
		'#': types.SECTION,
		'^': types.INVERTED,
		'/': types.CLOSING,
		'>': types.PARTIAL,
		'!': types.COMMENT
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
			var trimmed, firstChar, identifiers;

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


	var OpeningBracket, TagName, AttributeCollection, Solidus, ClosingBracket, Attribute, AttributeName, AttributeValue;


	var genericToken = function ( options ) {
		var Token, pattern, length;

		if ( typeof options.pattern === 'string' ) {
			length = options.pattern.length;
			pattern = new RegExp( '^' + A.utils.escape( options.pattern ) + '$' );
		} else {
			pattern = options.pattern;
		}


		Token = function () {
			this.value = '';
			this.pattern = pattern;
			this.required = options.required;

			this.length = options.length || length;
		};

		Token.prototype = {
			toString: options.toString || function () {
				return this.value;
			},

			read: function ( char ) {
				var newValue;

				if ( char.length > 1 ) {
					throw 'Token can only read one character at a time';
				}

				if ( this.sealed ) {
					return false;
				}

				newValue = this.value + char;

				if ( this.pattern.test( newValue ) ) {
					this.value = newValue;

					// if we know how long this token should be, and we're at that length, we can seal
					if ( this.length && this.value.length === this.length ) {
						this.seal();
					}

					return true;
				}

				this.seal();
				return false;
			},

			seal: function () {
				var i, properties, match, value;

				value = this.value;

				if ( this.required && !pattern.test( value ) ) {
					throw 'Token string "' + value + '" did not match pattern ' + pattern;
				}

				if ( options.properties && pattern ) {
					properties = ( typeof options.properties === 'string' ? [ options.properties ] : options.properties );

					i = properties.length;
					match = pattern.exec( this.value );

					while ( i-- ) {
						this[ properties[i] ] = ( match ? match[ i+1 ] : '' );
					}
				}

				if ( options.onseal ) {
					options.onseal.call( this, value );
				}

				this.sealed = true;
			}
		};

		return Token;
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
			var i, len, attributes, numAttributes;

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


	// OpeningBracket = genericToken({
	// 	pattern: '<',
	// 	required: true
	// });

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


	// TagName = genericToken({
	// 	pattern: /^([a-zA-Z][a-zA-Z0-9]*)$/,
	// 	required: true
	// });


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
			else {
				this.seal();
				return false;
			}
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

			
			if ( !this.tokens.length ) {
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



	// Solidus = genericToken({
	// 	pattern: '/'
	// });

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

	// ClosingBracket = genericToken({
	// 	pattern: '>',
	// 	required: true
	// });

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
	





	tokenize = function ( template ) {
		var stream, fragmentStub;

		stream = TokenStream.fromString( stripHtmlComments( template ) );

		return stream.tokens;
	};



	A.utils.tokenize = tokenize;

}( Anglebars ));
(function ( A ) {

	'use strict';

	var FragmentStub,
		TextStub,
		ElementStub,
		SectionStub,
		MustacheStub,

		types,

		voidElementNames,
		allElementNames,
		closedByParentClose,
		implicitClosersByTagName,

		elementIsClosedBy;


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


	TextStub = function ( token ) {
		this.text = token.value;
	};

	TextStub.prototype = {
		toJson: function () {
			return this.text;
		},

		toString: function () {
			return this.text;
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
					value: A.utils.getFragmentStubFromTokens( items[i].value.tokens, this.parentFragment.priority + 1 )
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
			var json, attrName, attrValue, str, i, fragStr;

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
			var str, i, len, attrStr, attrValueStr, fragStr, itemStr, isVoid;

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
				json.fmtrs = this.formatters;
			}

			if ( this.inverted ) {
				json.inv = true;
			}

			if ( this.priority ) {
				json.p = this.parentFragment.priority;
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
				json.fmtrs = this.formatters;
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




	A.utils.getFragmentStubFromTokens = function ( tokens, priority ) {
		var fragStub = new FragmentStub( null, priority || 0 ), token;

		while ( tokens.length ) {
			token = tokens.shift();
			fragStub.read( token );
		}

		return fragStub;
	};

}( Anglebars ));
(function ( A ) {

	// ViewModel constructor
	A.ViewModel = function ( data ) {
		// Initialise with supplied data, or create an empty object
		this.data = data || {};

		// Create empty array for keypaths that can't be resolved initially
		this.pendingResolution = [];

		// Create empty object for observers
		this.observers = {};
	};

	A.ViewModel.prototype = {

		// Update the `value` of `keypath`, and notify the observers of
		// `keypath` and its descendants
		set: function ( keypath, value ) {
			var k, keys, key, obj, i, unresolved, fullKeypath;

			// Allow multiple values to be set in one go
			if ( typeof keypath === 'object' ) {
				for ( k in keypath ) {
					if ( keypath.hasOwnProperty( k ) ) {
						this.set( k, keypath[k] );
					}
				}

				return;
			}


			// Split key path into keys (e.g. `'foo.bar[0]'` -> `['foo','bar',0]`)
			keys = A.utils.splitKeypath( keypath );

			// TODO accommodate implicit array generation
			obj = this.data;
			while ( keys.length > 1 ) {
				key = keys.shift();
				obj = obj[ key ] || {};
			}

			key = keys[0];

			obj[ key ] = value;

			// Trigger updates of views that observe `keypaths` or its descendants
			this._notifyObservers( keypath, value );

			// See if we can resolve any of the unresolved keypaths (if such there be)
			i = this.pendingResolution.length;
			while ( i-- ) { // Work backwards, so we don't go in circles!
				unresolved = this.pendingResolution.splice( i, 1 )[0];

				fullKeypath = this.getFullKeypath( unresolved.view.model.ref, unresolved.view.contextStack );

				// If we were able to find a keypath, initialise the view
				if ( fullKeypath !== undefined ) {
					unresolved.callback( fullKeypath );
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

			keys = A.utils.splitKeypath( keypath );

			result = this.data;
			while ( keys.length ) {
				if ( result ) {
					result = result[ keys.shift() ];
				}

				if ( result === undefined ) {
					return result;
				}
			}

			return result;
		},

		// Force notify observers of `keypath` (useful if e.g. an array or object member
		// was changed without calling `anglebars.set()`)
		update: function ( keypath ) {
			var value = this.get( keypath );
			this._notifyObservers( keypath, value );
		},

		registerView: function ( view ) {
			var self = this, fullKeypath, initialUpdate, value, formatted;

			initialUpdate = function ( keypath ) {
				view.keypath = keypath;

				// create observers
				view.observerRefs = self.observe({
					keypath: keypath,
					priority: view.model.p || 0,
					view: view
				});

				value = self.get( keypath );
				formatted = view.anglebars._format( value, view.model.fmtrs );

				view.update( formatted );
			};

			fullKeypath = this.getFullKeypath( view.model.ref, view.contextStack );

			if ( fullKeypath === undefined ) {
				this.registerUnresolvedKeypath({
					view: view,
					callback: initialUpdate
				});
			} else {
				initialUpdate( fullKeypath );
			}
		},

		// Resolve a full keypath from `ref` within the given `contextStack` (e.g.
		// `'bar.baz'` within the context stack `['foo']` might resolve to `'foo.bar.baz'`
		getFullKeypath: function ( ref, contextStack ) {

			var innerMost;

			// Implicit iterators - i.e. {{.}} - are a special case
			if ( ref === '.' ) {
				return contextStack[ contextStack.length - 1 ];
			}

			// Clone the context stack, so we don't mutate the original
			contextStack = contextStack.concat();

			// Take each context from the stack, working backwards from the innermost context
			while ( contextStack.length ) {

				innerMost = contextStack.pop();

				if ( this.get( innerMost + '.' + ref ) !== undefined ) {
					return innerMost + '.' + ref;
				}
			}

			if ( this.get( ref ) !== undefined ) {
				return ref;
			}
		},

		registerUnresolvedKeypath: function ( unresolved ) {
			this.pendingResolution[ this.pendingResolution.length ] = unresolved;
		},

		_notifyObservers: function ( keypath, value ) {
			var self = this, observersGroupedByLevel = this.observers[ keypath ] || [], i, j, priority, observer, formatted, actualValue;

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

						if ( observer.view ) {
							formatted = observer.view.anglebars._format( actualValue, observer.view.model.fmtrs );
							observer.view.update( formatted );
						}

						if ( observer.callback ) {
							observer.callback( actualValue );
						}
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
			var priorities, observers, index;

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
				for ( var i=0, len=observers.length; i<len; i+=1 ) {
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

}( Anglebars ));

(function ( A ) {

	'use strict';

	var domViewMustache, DomViews, utils, types, ctors;

	types = A.types;

	ctors = [];
	ctors[ types.TEXT ]         = 'Text';
	ctors[ types.INTERPOLATOR ] = 'Interpolator';
	ctors[ types.TRIPLE ]       = 'Triple';
	ctors[ types.SECTION ]      = 'Section';
	ctors[ types.ELEMENT ]      = 'Element';
	ctors[ types.PARTIAL ]      = 'Partial';

	utils = A.utils;

	// View constructor factory
	domViewMustache = function ( proto ) {
		var Mustache;

		Mustache = function ( options ) {

			this.model          = options.model;
			this.anglebars      = options.anglebars;
			this.viewmodel      = options.anglebars.viewmodel;
			this.parentNode     = options.parentNode;
			this.parentFragment = options.parentFragment;
			this.contextStack   = options.contextStack || [];
			this.anchor         = options.anchor;
			this.index          = options.index;

			this.type = options.model.type;

			this.initialize();

			this.viewmodel.registerView( this );

			// if we have a failed keypath lookup, and this is an inverted section,
			// we need to trigger this.update() so the contents are rendered
			if ( !this.keypath && this.model.inverted ) { // test both section-hood and inverticity in one go
				this.update( false );
			}
		};

		Mustache.prototype = proto;

		return Mustache;
	};


	// View types
	DomViews = A.DomViews = {
		create: function ( options ) {
			if ( typeof options.model === 'string' ) {
				return new DomViews.Text( options );
			}
			return new DomViews[ ctors[ options.model.type ] ]( options );
		}
	};


	// Fragment
	DomViews.Fragment = function ( options, wait ) {

		var numModels, i, itemOptions, async;


		// if we have an HTML string, our job is easy. TODO consider async?
		if ( typeof options.model === 'string' ) {
			this.nodes = utils.insertHtml( options.model, options.parentNode, options.anchor );
			return;
		}

		// otherwise we have to do some work

		async = options.anglebars.async;

		this.owner = options.owner;
		this.index = options.index;

		if ( !async ) {
			itemOptions = {
				anglebars:      options.anglebars,
				parentNode:     options.parentNode,
				contextStack:   options.contextStack,
				anchor:         options.anchor,
				parentFragment: this
			};
		}

		this.items = [];
		this.queue = [];

		numModels = options.model.length;
		for ( i=0; i<numModels; i+=1 ) {


			if ( async ) {
				itemOptions = {
					index:          i,
					model:          options.model[i],
					anglebars:      options.anglebars,
					parentNode:     options.parentNode,
					contextStack:   options.contextStack,
					anchor:         options.anchor,
					parentFragment: this
				};

				this.queue[ this.queue.length ] = itemOptions;
			} else {
				itemOptions.model = options.model[i];
				itemOptions.index = i;

				this.items[i] = DomViews.create( itemOptions );
			}
		}

		if ( async && !wait ) {
			options.anglebars.queue( this.queue );
			delete this.queue;
		}
	};

	DomViews.Fragment.prototype = {
		teardown: function () {
			var node;

			// if this was built from HTML, we just need to remove the nodes
			if ( this.nodes ) {
				while ( this.nodes.length ) {
					node = this.nodes.pop();
					node.parentNode.removeChild( node );
				}
			}

			// otherwise we need to do a proper teardown
			while ( this.items.length ) {
				this.items.pop().teardown();
			}
		},

		firstNode: function () {
			if ( this.items[0] ) {
				return this.items[0].firstNode();
			} else {
				if ( this.parentSection ) {
					return this.parentSection.findNextNode( this );
				}
			}

			return null;
		},

		findNextNode: function ( item ) {
			var index;

			index = item.index;

			if ( this.items[ index + 1 ] ) {
				return this.items[ index + 1 ].firstNode();
			} else {
				if ( this.parentSection ) {
					return this.parentSection.findNextNode( this );
				}
			}

			return null;
		}
	};


	// Partials
	DomViews.Partial = function ( options ) {
		var compiledPartial;

		this.fragment = new DomViews.Fragment({
			model:        options.anglebars.compiledPartials[ options.model.id ] || [],
			anglebars:    options.anglebars,
			parentNode:   options.parentNode,
			contextStack: options.contextStack,
			anchor:       options.anchor,
			owner:        this
		});
	};

	DomViews.Partial.prototype = {
		teardown: function () {
			this.fragment.teardown();
		}
	};


	// Plain text
	DomViews.Text = function ( options ) {
		this.node = document.createTextNode( options.model );
		this.index = options.index;
		this.anglebars = options.anglebars;
		this.parentNode = options.parentNode;

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		this.parentNode.insertBefore( this.node, options.anchor || null );
	};

	DomViews.Text.prototype = {
		teardown: function () {
			if ( this.anglebars.el.contains( this.node ) ) {
				this.parentNode.removeChild( this.node );
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Element
	DomViews.Element = function ( options ) {

		var binding,
			model,
			namespace,
			attr,
			attrName,
			attrValue;

		// stuff we'll need later
		model = this.model = options.model;
		this.anglebars = options.anglebars;
		this.viewmodel = options.anglebars.viewmodel;
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
		this.node = document.createElementNS( namespace, model.tag );


		// set attributes
		this.attributes = [];
		for ( attrName in model.attrs ) {
			if ( model.attrs.hasOwnProperty( attrName ) ) {
				attrValue = model.attrs[ attrName ];

				attr = new DomViews.Attribute({
					owner: this,
					name: attrName,
					value: attrValue,
					anglebars: options.anglebars,
					parentNode: this.node,
					contextStack: options.contextStack
				});

				// if two-way binding is enabled, and we've got a dynamic `value` attribute, and this is an input or textarea, set up two-way binding
				if ( attrName === 'value' && this.anglebars.twoway && ( model.tag.toLowerCase() === 'input' || model.tag.toLowerCase() === 'textarea' ) ) {
					binding = attr;
				}

				this.attributes[ this.attributes.length ] = attr;
			}
		}

		if ( binding ) {
			this.bind( binding, options.anglebars.lazy );
		}

		// append children, if there are any
		if ( model.frag ) {
			this.children = new DomViews.Fragment({
				model:        model.frag,
				anglebars:    options.anglebars,
				parentNode:   this.node,
				contextStack: options.contextStack,
				anchor:       null,
				owner:        this
			});
		}

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		this.parentNode.insertBefore( this.node, options.anchor || null );
	};

	DomViews.Element.prototype = {
		bind: function ( attribute, lazy ) {

			var viewmodel = this.viewmodel, node = this.node, setValue, valid, interpolator, keypath;

			// Check this is a suitable candidate for two-way binding - i.e. it is
			// a single interpolator with no formatters
			valid = true;
			if ( !attribute.children ||
			     ( attribute.children.length !== 1 ) ||
			     ( attribute.children[0].type !== A.types.INTERPOLATOR ) ||
			     ( attribute.children[0].model.formatters && attribute.children[0].model.formatters.length )
			) {
				throw 'Not a valid two-way data binding candidate - must be a single interpolator with no formatters';
			}

			interpolator = attribute.children[0];

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
			if ( this.anglebars.el.contains( this.node ) ) {
				this.parentNode.removeChild( this.node );
			}

			this.children.teardown();

			while ( this.attributes.length ) {
				this.attributes.pop().teardown();
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Attribute
	DomViews.Attribute = function ( options ) {

		var i, name, value, colonIndex, namespacePrefix, namespace, ancestor;

		name = options.name;
		value = options.value;

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
					ancestor = ancestor.parentNode || options.owner.parentFragment.owner.node || options.owner.parentFragment.owner.parentNode;
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

		i = value.length;
		while ( i-- ) {
			this.children[i] = A.TextViews.create({
				model:        value[i],
				anglebars:    options.anglebars,
				parent:       this,
				contextStack: options.contextStack
			});
		}

		// manually trigger first update
		this.update();
	};

	DomViews.Attribute.prototype = {
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
			this.value = this.toString();

			if ( this.value !== prevValue ) {
				if ( this.namespace ) {
					this.parentNode.setAttributeNS( this.namespace, this.name, this.value );
				} else {
					this.parentNode.setAttribute( this.name, this.value );
				}
			}
		},

		toString: function () {
			return this.children.join( '' );
		}
	};





	// Interpolator
	DomViews.Interpolator = domViewMustache({
		initialize: function () {
			this.node = document.createTextNode( '' );

			this.parentNode.insertBefore( this.node, this.anchor || null );
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}

			if ( this.anglebars.el.contains( this.node ) ) {
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
	});


	// Triple
	DomViews.Triple = domViewMustache({
		initialize: function () {
			this.nodes = [];

			// this.tripleAnchor = Anglebars.utils.createAnchor();
			// this.parentNode.insertBefore( this.tripleAnchor, this.anchor || null );
		},

		teardown: function () {

			// remove child nodes from DOM
			if ( this.anglebars.el.contains( this.parentNode ) ) {
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
			var numNodes, i, anchor;

			if ( html === this.html ) {
				return;
			} else {
				this.html = html;
			}

			anchor = ( this.initialised ? this.parentFragment.findNextNode( this ) : this.anchor );

			// remove existing nodes
			while ( this.nodes.length ) {
				this.parentNode.removeChild( this.nodes.pop() );
			}

			// get new nodes
			this.nodes = utils.getNodeArrayFromHtml( html, false );

			numNodes = this.nodes.length;
			if ( numNodes ) {
				anchor = this.parentFragment.findNextNode( this );

				for ( i=0; i<numNodes; i+=1 ) {
					this.parentNode.insertBefore( this.nodes[i], anchor );
				}
			}

			this.initialised = true;
		}
	});



	// Section
	DomViews.Section = domViewMustache({
		initialize: function () {
			this.views = [];
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
			if ( this.views[0] ) {
				return this.views[0].firstNode();
			}

			return this.parentFragment.findNextNode( this );
		},

		findNextNode: function ( fragment ) {
			if ( this.views[ fragment.index + 1 ] ) {
				return this.views[ fragment.index + 1 ].firstNode();
			} else {
				return this.parentFragment.findNextNode( this );
			}
		},

		unrender: function () {
			while ( this.views.length ) {
				this.views.shift().teardown();
			}
		},

		update: function ( value ) {
			var emptyArray, i, viewsToRemove, anchor, fragmentOptions;

			if ( this.anglebars.async ) {
				this.queue = [];
			}

			fragmentOptions = {
				model:        this.model.frag,
				anglebars:    this.anglebars,
				parentNode:   this.parentNode,
				anchor:       this.parentFragment.findNextNode( this ),
				owner:        this
			};

			// treat empty arrays as false values
			if ( utils.isArray( value ) && value.length === 0 ) {
				emptyArray = true;
			}


			// if section is inverted, only check for truthiness/falsiness
			if ( this.model.inverted ) {
				if ( value && !emptyArray ) {
					if ( this.length ) {
						this.unrender();
						this.length = 0;
						return;
					}
				}

				else {
					if ( !this.length ) {
						anchor = this.parentFragment.findNextNode( this );

						// no change to context stack in this situation
						fragmentOptions.contextStack = this.contextStack;
						fragmentOptions.index = 0;

						this.views[0] = new DomViews.Fragment( fragmentOptions );
						this.length = 1;
						return;
					}
				}

				return;
			}


			// otherwise we need to work out what sort of section we're dealing with

			// if value is an array, iterate through
			if ( utils.isArray( value ) ) {

				// if the array is shorter than it was previously, remove items
				if ( value.length < this.length ) {
					viewsToRemove = this.views.splice( value.length, this.length - value.length );

					while ( viewsToRemove.length ) {
						viewsToRemove.pop().teardown();
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

							this.views[i] = new DomViews.Fragment( fragmentOptions, true ); // true to prevent queue being updated in wrong order

							if ( this.anglebars.async ) {
								this.queue = this.queue.concat( this.views[i].queue );
							}
						}

						if ( this.anglebars.async ) {
							this.anglebars.queue( this.queue );
						}
					}
				}

				this.length = value.length;
			}

			// if value is a hash...
			else if ( utils.isObject( value ) ) {
				// ...then if it isn't rendered, render it, adding this.keypath to the context stack
				// (if it is already rendered, then any children dependent on the context stack
				// will update themselves without any prompting)
				if ( !this.length ) {
					// append this section to the context stack
					fragmentOptions.contextStack = this.contextStack.concat( this.keypath );
					fragmentOptions.index = 0;

					this.views[0] = new DomViews.Fragment( fragmentOptions );
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

						this.views[0] = new DomViews.Fragment( fragmentOptions );
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
		}
	});

}( Anglebars ));

(function ( A ) {

	'use strict';

	var textViewMustache, TextViews, types, ctors;

	types = A.types;

	ctors = [];
	ctors[ types.TEXT ] = 'Text';
	ctors[ types.INTERPOLATOR ] = 'Interpolator';
	ctors[ types.TRIPLE ] = 'Triple';
	ctors[ types.SECTION ] = 'Section';

	// Substring constructor factory
	textViewMustache = function ( proto ) {
		var Mustache;

		Mustache = function ( options ) {

			this.model = options.model;
			this.anglebars = options.anglebars;
			this.viewmodel = options.anglebars.viewmodel;
			this.parent = options.parent;
			this.contextStack = options.contextStack || [];

			this.type = options.model.type;

			// If there is an init method, call it
			if ( this.initialize ) {
				this.initialize();
			}

			this.viewmodel.registerView( this );

			// If we have a failed keypath lookup, and this is an inverted section,
			// we need to trigger this.update() so the contents are rendered
			if ( !this.keypath && this.model.inverted ) { // Test both section-hood and inverticity in one go
				this.update( false );
			}
		};

		Mustache.prototype = proto;

		return Mustache;
	};


	// Substring types
	TextViews = A.TextViews = {
		create: function ( options ) {
			if ( typeof options.model === 'string' ) {
				return new TextViews.Text( options.model );
			}

			return new TextViews[ ctors[ options.model.type ] ]( options );
		}
	};



	// Fragment
	TextViews.Fragment = function ( options ) {
		var numItems, i, itemOptions;

		this.parent = options.parent;
		this.items = [];

		itemOptions = {
			anglebars:    options.anglebars,
			parent:       this,
			contextStack: options.contextStack
		};

		numItems = ( options.models ? options.models.length : 0 );
		for ( i=0; i<numItems; i+=1 ) {
			itemOptions.model = this.models[i];
			this.items[ this.items.length ] = TextViews.create( itemOptions );
		}

		this.value = this.items.join('');
	};

	TextViews.Fragment.prototype = {
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
			return ( this.value === undefined ? '' : this.value );
		}
	};



	// Plain text
	TextViews.Text = function ( text ) {
		this.text = text;
	};

	TextViews.Text.prototype = {
		toString: function () {
			return this.text;
		},

		teardown: function () {} // no-op
	};


	// Mustaches

	// Interpolator or Triple
	TextViews.Interpolator = textViewMustache({
		update: function ( value ) {
			this.value = value;
			this.parent.bubble();
		},

		bubble: function () {
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
	});

	// Triples are the same as Interpolators in this context
	TextViews.Triple = TextViews.Interpolator;


	// Section
	TextViews.Section = textViewMustache({
		initialize: function () {
			this.children = [];
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
			while ( this.children.length ) {
				this.children.shift().teardown();
			}
			this.length = 0;
		},

		bubble: function () {
			this.value = this.children.join( '' );
			this.parent.bubble();
		},

		update: function ( value ) {
			var emptyArray, i, childrenToRemove;

			// treat empty arrays as false values
			if ( A.utils.isArray( value ) && value.length === 0 ) {
				emptyArray = true;
			}

			// if section is inverted, only check for truthiness/falsiness
			if ( this.model.inverted ) {
				if ( value && !emptyArray ) {
					if ( this.length ) {
						this.unrender();
						this.length = 0;
					}
				}

				else {
					if ( !this.length ) {
						this.children[0] = new TextViews.Fragment( this.model.frag, this.anglebars, this, this.contextStack );
						this.length = 1;
					}
				}

				this.value = this.children.join( '' );
				this.parent.bubble();

				return;
			}


			// Otherwise we need to work out what sort of section we're dealing with.
			if( typeof value === 'object' ) {



				// if value is an array, iterate through
				if ( A.utils.isArray( value ) ) {

					// if the array is shorter than it was previously, remove items
					if ( value.length < this.length ) {
						childrenToRemove = this.children.splice( value.length, this.length - value.length );

						while ( childrenToRemove.length ) {
							childrenToRemove.shift().teardown();
						}
					}

					// otherwise...
					else {

						// first, update existing views
						for ( i=0; i<this.length; i+=1 ) {
							this.viewmodel.update( this.keypath + '.' + i );
						}

						if ( value.length > this.length ) {

							// then add any new ones
							for ( i=this.length; i<value.length; i+=1 ) {
								this.children[i] = new TextViews.Fragment( this.model.frag, this.anglebars, this, this.contextStack.concat( this.keypath + '.' + i ) );
							}
						}
					}

					this.length = value.length;
				}

				// if value is a hash...
				else {
					// ...then if it isn't rendered, render it, adding this.keypath to the context stack
					// (if it is already rendered, then any children dependent on the context stack
					// will update themselves without any prompting)
					if ( !this.length ) {
						this.children[0] = new TextViews.Fragment( this.model.frag, this.anglebars, this, this.contextStack.concat( this.keypath ) );
						this.length = 1;
					}
				}
			}

			// otherwise render if value is truthy, unrender if falsy
			else {

				if ( value && !emptyArray ) {
					if ( !this.length ) {
						this.children[0] = new TextViews.Fragment( this.model.frag, this.anglebars, this, this.contextStack );
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

			this.value = this.children.join( '' );
			this.parent.bubble();
		},

		toString: function () {
			return ( this.value === undefined ? '' : this.value );
		}
	});

}( Anglebars ));

// export
if ( typeof module !== "undefined" && module.exports ) module.exports = Anglebars // Common JS
else if ( typeof define === "function" && define.amd ) define( function () { return Anglebars } ) // AMD
else { global.Anglebars = Anglebars }

}( this ));
