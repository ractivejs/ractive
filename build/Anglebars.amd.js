define([], function() { 

/*! Anglebars - v0.1.2 - 2013-01-08
* http://rich-harris.github.com/Anglebars/
* Copyright (c) 2013 Rich Harris; Licensed WTFPL */

/*jslint eqeq: true, plusplus: true */
/*global document, HTMLElement */

'use strict';




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
	var nodes, stubs, compiled = [], delimiters, tripleDelimiters, utils = Anglebars.utils;

	options = options || {};

	// If delimiters are specified use them, otherwise reset to defaults
	Anglebars.delimiters = options.delimiters || [ '{{', '}}' ];
	Anglebars.tripleDelimiters = options.tripleDelimiters || [ '{{{', '}}}' ];

	// Compile the regex that will be used to parse the template
	Anglebars.utils.compileMustachePattern();

	// Collapse any standalone mustaches and remove templates
	template = utils.preProcess( template );

	// Parse the template
	nodes = utils.getNodeArrayFromHtml( template, ( options.replaceSrcAttributes === undefined ? true : options.replaceSrcAttributes ) );

	// Get an array of 'stubs' from the resulting DOM nodes
	stubs = utils.getStubsFromNodes( nodes );

	// Compile the stubs
	compiled = utils.compileStubs( stubs, 0, options.preserveWhitespace );

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
	TEXT:         0,
	INTERPOLATOR: 1,
	TRIPLE:       2,
	SECTION:      3,
	ELEMENT:      4,
	PARTIAL:      5,
	COMMENT:      6,
	DELIMCHANGE:  7,
	MUSTACHE:     8
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
		getNodeArrayFromHtml: function ( html, replaceSrcAttributes ) {

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
		},


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


		// Split partialKeypath ('foo.bar.baz[0]') into keys (['foo', 'bar', 'baz', 0])
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

		compileMustachePattern: function () {
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
		},


		// collapse standalones (i.e. mustaches that sit on a line by themselves) and remove comments
		preProcess: function ( str ) {
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
		},



		// find the first mustache in a string, and store some information about it. Returns an array
		// - the result of regex.exec() - with some additional properties
		findMustache: function ( text, startIndex ) {

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
		},


		// find the first match of a pattern within a string. Returns an array with start and end properties indicating where the match was found within the string
		findMatch: function ( text, pattern, startIndex ) {

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
		},


		getStubsFromNodes: function ( nodes ) {
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
		},

		expandText: function ( text ) {
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
		},

		// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
		isArray: function ( obj ) {
			return Object.prototype.toString.call( obj ) === '[object Array]';
		},

		isObject: function ( obj ) {
			return ( Object.prototype.toString.call( obj ) === '[object Object]' ) && ( typeof obj !== 'function' );
		},

		compileStubs: function ( stubs, priority, preserveWhitespace ) {
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
		},

		processElementStub: function ( stub, priority ) {
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
				} else {
					attributes[ attributes.length ] = utils.processAttribute( attribute.name, attribute.value, priority + 1 );
				}
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
		}
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

				fullKeypath = this.getFullKeypath( unresolved.view.model.partialKeypath, unresolved.view.contextStack );

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
					priority: view.model.priority,
					view: view
				});

				value = self.get( keypath );
				formatted = view.anglebars._format( value, view.model.formatters );

				view.update( formatted );
			};

			fullKeypath = this.getFullKeypath( view.model.partialKeypath, view.contextStack );

			if ( fullKeypath === undefined ) {
				this.registerUnresolvedKeypath({
					view: view,
					callback: initialUpdate
				});
			} else {
				initialUpdate( fullKeypath );
			}
		},

		// Resolve a full keypath from `partialKeypath` within the given `contextStack` (e.g.
		// `'bar.baz'` within the context stack `['foo']` might resolve to `'foo.bar.baz'`
		getFullKeypath: function ( partialKeypath, contextStack ) {

			var innerMost;

			// Implicit iterators - i.e. {{.}} - are a special case
			if ( partialKeypath === '.' ) {
				return contextStack[ contextStack.length - 1 ];
			}

			// Clone the context stack, so we don't mutate the original
			contextStack = contextStack.concat();

			// Take each context from the stack, working backwards from the innermost context
			while ( contextStack.length ) {

				innerMost = contextStack.pop();

				if ( this.get( innerMost + '.' + partialKeypath ) !== undefined ) {
					return innerMost + '.' + partialKeypath;
				}
			}

			if ( this.get( partialKeypath ) !== undefined ) {
				return partialKeypath;
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
							formatted = observer.view.anglebars._format( actualValue, observer.view.model.formatters );
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
	TextViews.Text = function ( options ) {
		this.text = options.model.text;
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
						this.children[0] = new TextViews.Fragment( this.model.children, this.anglebars, this, this.contextStack );
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
								this.children[i] = new TextViews.Fragment( this.model.children, this.anglebars, this, this.contextStack.concat( this.keypath + '.' + i ) );
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
						this.children[0] = new TextViews.Fragment( this.model.children, this.anglebars, this, this.contextStack.concat( this.keypath ) );
						this.length = 1;
					}
				}
			}

			// otherwise render if value is truthy, unrender if falsy
			else {

				if ( value && !emptyArray ) {
					if ( !this.length ) {
						this.children[0] = new TextViews.Fragment( this.model.children, this.anglebars, this, this.contextStack );
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
 return Anglebars; 
});
