/*! Anglebars - v0.1.0 - 2012-11-15
* http://rich-harris.github.com/Anglebars/
* Copyright (c) 2012 Rich Harris; Licensed WTFPL */

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
	if ( options.el !== undefined ) {
		this.el = Anglebars.utils.getEl( options.el );
	}

	// `compiled` **object** *optional*  
	// A precompiled template, generated with the static `Anglebars.compile`
	// method.
	if ( options.compiled !== undefined ) {
		this.compiled = options.compiled;
	}

	// `template` **string** *optional*  
	// A string containing valid HTML (albeit with mustaches), to be used in
	// the absence of a precompiled template (e.g. during initial development)
	if ( options.template !== undefined ) {
		this.template = options.template;
	}

	// `partials` **object** *optional*  
	// A hash containing strings representing partial templates
	if ( options.partials !== undefined ) {
		this.partials = options.partials;
	}

	// `data` **object | Anglebars.ViewModel** *optional*  
	// An object or an `Anglebars.ViewModel` instance containing the data with
	// which to populate the template. Passing in an existing `Anglebars.ViewModel`
	// instance allows separate Anglebars instances to share a single view model
	this.viewmodel = ( options.data instanceof Anglebars.ViewModel ? options.data : new Anglebars.ViewModel( options.data ) );
	
	// `formatters` **object** *optional*  
	// An object containing mustache formatter functions
	if ( options.formatters !== undefined ) {
		this.formatters = options.formatters;
	}

	// `preserveWhitespace` **boolean** *optional*  
	// Whether or not to preserve whitespace in the template (e.g. newlines
	// between elements), which is usually ignored by the browser. Defaults
	// to `false`
	this.preserveWhitespace = ( options.preserveWhitespace === undefined ? false : options.preserveWhitespace );

	// `replaceSrcAttributes` **boolean** *optional*  
	// Whether to replace src attributes with data-anglebars-src during template
	// compilation (prevents browser requesting non-existent resources).
	// Defaults to `true`
	this.replaceSrcAttributes = ( options.replaceSrcAttributes === undefined ? true : options.replaceSrcAttributes );

	// `namespace` **string** *optional*
	// What namespace to treat as the parent namespace when compiling. This will
	// be guessed from the container element, but can be overridden
	this.namespace = ( options.namespace ? options.namespace : ( this.el && this.el.namespaceURI !== 'http://www.w3.org/1999/xhtml' ? this.el.namespaceURI : null ) );



	// Initialization
	// --------------

	// If we were given a template, compile it
	if ( !this.compiled && this.template ) {
		this.compiled = Anglebars.compile( this.template, {
			preserveWhitespace: this.preserveWhitespace,
			replaceSrcAttributes: this.replaceSrcAttributes,
			namespace: this.namespace,
			partials: this.partials
		});
	}

	// Clear container and render
	if ( this.compiled && this.el ) {
		this.el.innerHTML = '';
		this.render();
	}
};



// Prototype methods
// =================
Anglebars.prototype = {
	
	// Render instance to element specified here or at initialization
	render: function ( el ) {
		el = ( el ? Anglebars.utils.getEl( el ) : this.el );

		if ( !el ) {
			throw new Error( 'You must specify a DOM element to render to' );
		}

		this.rendered = new Anglebars.views.Fragment({
			model: this.compiled,
			anglebars: this,
			parentNode: el
		});
	},

	teardown: function () {
		this.rendered.teardown();
		this.el.innerHTML = '';
	},

	// Proxies for viewmodel `set`, `get` and `update` methods
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
		var i, numFormatters, formatter, name, args;

		numFormatters = formatters.length;
		for ( i=0; i<numFormatters; i+=1 ) {
			formatter = formatters[i];
			name = formatter.name;
			args = formatter.args || [];

			if ( this.formatters[ name ] ) {
				value = this.formatters[ name ].apply( this, [ value ].concat( args ) );
			}
		}

		return value;
	}
};
(function ( A ) {

	'use strict';

	var utils = A.utils = {
		// Remove node from DOM if it exists
		remove: function ( node ) {
			if ( node.parentNode ) {
				node.parentNode.removeChild( node );
			}
		},


		// Strip whitespace from the start and end of strings
		trim: function ( text ) {
			var trimmed = text.replace( /^\s+/, '' ).replace( /\s+$/, '' );
			return trimmed;
		},


		// convert HTML to an array of DOM nodes
		getNodeArrayFromHtml: function ( html, replaceSrcAttributes ) {

			var temp, i, numNodes, nodes = [], attrs, tags, pattern;

			html = '' + html; // coerce non-string values to string (i.e. in triples)

			// TODO work out the most efficient way to do this

			// replace src attribute with data-anglebars-src
			if ( replaceSrcAttributes ) {
				attrs = [ 'src', 'poster' ];

				for ( i=0; i<attrs.length; i+=1 ) {
					pattern = new RegExp( '(<[^>]+\\s)(' + attrs[i] + '=)', 'g' );
					html = html.replace( pattern, '$1data-anglebars-' + attrs[i] + '=' );
				}
			}

			// replace table tags with <div data-anglebars-elementname='table'></div> -
			// this is because the way browsers parse table HTML is F**CKING MENTAL
			var replaceFunkyTags = true;
			if ( replaceFunkyTags ) {
				tags = [ 'table', 'thead', 'tbody', 'tr', 'th', 'td' ];

				for ( i=0; i<tags.length; i+=1 ) {
					pattern = new RegExp( '<(' + tags[i] + ')(\\s|>)', 'gi' );
					html = html.replace( pattern, '<div data-anglebars-elementname="$1"$2' );

					pattern = new RegExp( '<\\/' + tags[i] + '>', 'gi' );
					html = html.replace( pattern, '</div>' );
				}
			}

			temp = document.createElement( 'div' );
			temp.innerHTML = html;


			// create array from node list, as node lists have some undesirable properties
			numNodes = temp.childNodes.length;
			for ( i=0; i<numNodes; i+=1 ) {
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

			pattern = /\[([0-9]+)\]/;

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


		// convert a node list to an array (iterating through a node list directly often has... undesirable results)
		nodeListToArray: function ( nodes ) {
			var i, numNodes = nodes.length, result = [];

			for ( i=0; i<numNodes; i+=1 ) {
				result[i] = nodes[i];
			}

			return result;
		},


		// convert an attribute list to an array
		attributeListToArray: function ( attributes ) {
			var i, numAttributes = attributes.length, result = [];

			for ( i=0; i<numAttributes; i+=1 ) {
				result[i] = {
					name: attributes[i].name,
					value: attributes[i].value
				};
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
			typeTest = /section|comment|delimiterChange/;

			while ( remaining.length ) {
				mustache = utils.findMustache( remaining );


				// if there are no more mustaches, add the remaining text and be done
				if ( !mustache ) {
					result += remaining;
					break;
				}

				// if we've got a section, comment, or delimiter change mustache...
				if ( typeTest.test( mustache.type ) ) {
					pre = remaining.substr( 0, mustache.start ); // before the mustache
					post = remaining.substring( mustache.end );  // after the mustache

					// if there is newline + (whitespace)? immediately before the mustache, and
					// (whitespace)? + newline immediately after, remove one of them
					if ( preTest.test( pre ) && postTest.test( post ) ) {
						pre = pre.replace( /(?:\r)?\n\s*$/, '' );
					}

					result += pre;
					
					// strip comments
					if ( mustache.type !== 'comment' ) {
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

			var match, split, mustache, formulaSplitter, i, formatterNameAndArgs, formatterPattern, formatter, newDelimiters;

			mustache = A.patterns.mustache;
			formulaSplitter = ' | ';
			formatterPattern = A.patterns.formatter;

			match = utils.findMatch( text, mustache, startIndex );

			if ( match ) {

				// first, see if we're dealing with a delimiter change
				if ( match[3] && match[6] ) {
					match.type = 'delimiterChange';

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
					match.formatters = [];

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

							match.formatters.push( formatter );
						}
					}
					
					
					// figure out what type of mustache we're dealing with
					if ( match[9] ) {
						// mustache is a section
						match.type = 'section';
						match.inverted = ( match[9] === '^' ? true : false );
						match.closing = ( match[9] === '/' ? true : false );
					}

					else if ( match[10] ) {
						match.type = 'partial';
					}

					else if ( match[1] ) {
						// left side is a triple - check right side is as well
						if ( !match[14] ) {
							return false;
						}

						match.type = 'triple';
					}

					else if ( match[12] ) {
						match.type = 'comment';
					}

					else {
						match.type = 'interpolator';
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
						type: 'element',
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
			while ( mustache.type === 'delimiterChange' ) {
				
				if ( mustache.start > 0 ) {
					result[ result.length ] = {
						type: 'text',
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
						type: 'text',
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
					type: 'text',
					text: pre
				};
			}

			// add the mustache
			result[ result.length ] = {
				type: 'mustache',
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

		// borrowed wholesale from underscore... TODO include license? write an Anglebars-optimised version?
		isEqual: function ( a, b ) {
			
			var eq = function ( a, b, stack ) {

				var toString, className, length, size, result, key;

				toString = Object.prototype.toString;
				
				// Identical objects are equal. `0 === -0`, but they aren't identical.
				// See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
				if ( a === b ) {
					return ( a !== 0 || ( 1 / a == 1 / b ) );
				}
				
				// A strict comparison is necessary because `null == undefined`.
				if ( a == null || b == null ) {
					return a === b;
				}
				
				// Compare `[[Class]]` names.
				className = toString.call( a );
				if ( className != toString.call( b ) ) {
					return false;
				}
				
				switch ( className ) {
					// Strings, numbers, dates, and booleans are compared by value.
					case '[object String]':
						// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
						// equivalent to `new String("5")`.
						return a == String( b );
					
					case '[object Number]':
						// `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
						// other numeric values.
						return ( ( a != +a ) ? ( b != +b ) : ( a == 0 ? ( 1 / a == 1 / b ) : ( a == +b ) ) );
					
					case '[object Date]':
					case '[object Boolean]':
						// Coerce dates and booleans to numeric primitive values. Dates are compared by their
						// millisecond representations. Note that invalid dates with millisecond representations
						// of `NaN` are not equivalent.
						return +a == +b;
					// RegExps are compared by their source patterns and flags.
					case '[object RegExp]':
						return a.source == b.source &&
							a.global == b.global &&
							a.multiline == b.multiline &&
							a.ignoreCase == b.ignoreCase;
				}

				if ( typeof a != 'object' || typeof b != 'object' ) {
					return false;
				}
				
				// Assume equality for cyclic structures. The algorithm for detecting cyclic
				// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
				length = stack.length;
				
				while ( length-- ) {
					// Linear search. Performance is inversely proportional to the number of
					// unique nested structures.
					if ( stack[length] == a ) {
						return true;
					}
				}
				
				// Add the first object to the stack of traversed objects.
				stack.push( a );

				size = 0, result = true;
				// Recursively compare objects and arrays.
				
				if ( className == '[object Array]' ) {
					
					// Compare array lengths to determine if a deep comparison is necessary.
					size = a.length;
					result = size == b.length;
					
					if ( result ) {
						// Deep compare the contents, ignoring non-numeric properties.
						while ( size-- ) {
						// Ensure commutative equality for sparse arrays.
							if ( !( result = size in a == size in b && eq( a[ size ], b[ size ], stack ) ) ) {
								break;
							}
						}
					}
				} else {
					// Objects with different constructors are not equivalent.
					if ( 'constructor' in a != 'constructor' in b || a.constructor != b.constructor ) {
						return false;
					}
					
					// Deep compare objects.
					for ( key in a ) {
						if ( a.hasOwnProperty( key ) ) {
							// Count the expected number of properties.
							size++;
							// Deep compare each member.
							if ( !( result = b.hasOwnProperty( key ) && eq( a[ key ], b[ key ], stack ) ) ) {
								break;
							}
						}
					}

					// Ensure that both objects contain the same number of properties.
					if ( result ) {
						for ( key in b ) {
							if ( b.hasOwnProperty( key ) && !( size-- ) ) break;
						}
						result = !size;
					}
				}

				// Remove the first object from the stack of traversed objects.
				stack.pop();
				return result;
			};

			return eq( a, b, [] );
		},

		// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
		isArray: function ( obj ) {
			return Object.prototype.toString.call( obj ) === '[object Array]';
		},

		isObject: function ( obj ) {
			return ( Object.prototype.toString.call( obj ) === '[object Object]' ) && ( typeof obj !== 'function' );
		},

		compileStubs: function ( stubs, priority, namespace, preserveWhitespace ) {
			var compiled, next, processStub;

			compiled = [];

			processStub = function ( i ) {
				var whitespace, mustache, item, text, element, stub, sliceStart, sliceEnd, nesting, bit, partialKeypath;

				whitespace = /^\s*\n\r?\s*$/;

				stub = stubs[i];

				switch ( stub.type ) {
					case 'text':
						if ( !preserveWhitespace ) {
							if ( whitespace.test( stub.text ) || stub.text === '' ) {
								return i+1; // don't bother keeping this if it only contains whitespace, unless that's what the user wants
							}
						}

						compiled[ compiled.length ] = stub;
						return i+1;

					case 'element':
						compiled[ compiled.length ] = utils.processElementStub( stub, priority, namespace );
						return i+1;

					case 'mustache':

						partialKeypath = stub.mustache.partialKeypath;
						
						switch ( stub.mustache.type ) {
							case 'section':

								i += 1;
								sliceStart = i; // first item in section
								nesting = 1;

								// find end
								while ( ( i < stubs.length ) && !sliceEnd ) {
									
									bit = stubs[i];

									if ( bit.type === 'mustache' ) {
										if ( bit.mustache.type === 'section' && bit.mustache.partialKeypath === partialKeypath ) {
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

								compiled[ compiled.length ] = {
									type: 'section',
									partialKeypath: partialKeypath,
									formatters: stub.mustache.formatters,
									inverted: stub.mustache.inverted,
									children: utils.compileStubs( stubs.slice( sliceStart, sliceEnd ), priority + 1, namespace, preserveWhitespace ),
									priority: priority
								};
								return i;


							case 'triple':
								compiled[ compiled.length ] = {
									type: 'triple',
									partialKeypath: stub.mustache.partialKeypath,
									formatters: stub.mustache.formatters,
									priority: priority
								};
								return i+1;


							case 'interpolator':
								compiled[ compiled.length ] = {
									type: 'interpolator',
									partialKeypath: stub.mustache.partialKeypath,
									formatters: stub.mustache.formatters,
									priority: priority
								};
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

		processElementStub: function ( stub, priority, namespace ) {
			var proxy, attributes, numAttributes, attribute, i, node;

			node = stub.original;

			proxy = {
				type: 'element',
				tag: node.getAttribute( 'data-anglebars-elementname' ) || node.localName,
				priority: priority
			};

			// inherit namespace from parent, if applicable
			if ( namespace ) {
				proxy.namespace = namespace;
			}

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
			proxy.children = utils.compileStubs( utils.getStubsFromNodes( node.childNodes ), priority + 1, proxy.namespace );

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
			attribute.components = utils.compileStubs( stubs, priority, null );


			return attribute;
		}
	};

}( Anglebars ));
// Static method to compile a template string
Anglebars.compile = function ( template, options ) {
	var nodes, stubs, compiled = [], delimiters, tripleDelimiters, utils = Anglebars.utils;

	options = options || {};

	Anglebars.delimiters = options.delimiters || [ '{{', '}}' ];
	Anglebars.tripleDelimiters = options.tripleDelimiters || [ '{{{', '}}}' ];

	Anglebars.utils.compileMustachePattern();

	// Collapse any standalone mustaches and remove templates
	template = utils.preProcess( template );
	
	// Parse the template
	nodes = utils.getNodeArrayFromHtml( template, ( options.replaceSrcAttributes === undefined ? true : options.replaceSrcAttributes ) );

	// Get an array of 'stubs' from the resulting DOM nodes
	stubs = utils.getStubsFromNodes( nodes );

	// Compile the stubs
	compiled = utils.compileStubs( stubs, 0, options.namespace, options.preserveWhitespace );

	return compiled;
};

// Cached regexes
Anglebars.patterns = {
	formatter: /([a-zA-Z_$][a-zA-Z_$0-9]*)(\[[^\]]*\])?/,
	
	// for template preprocessor
	preprocessorTypes: /section|comment|delimiterChange/,
	standalonePre: /(?:\r)?\n[ \t]*$/,
	standalonePost: /^[ \t]*(\r)?\n/,
	standalonePreStrip: /[ \t]+$/
};


// Namespaces for submodules, with create helpers
Anglebars.views = {
	create: function ( options ) {
		var type = options.model.type;
		
		// get constructor name by capitalising model type
		type = type.charAt( 0 ).toUpperCase() + type.slice( 1 );

		return new Anglebars.views[ type ]( options );
	}
};

Anglebars.substrings = {
	create: function ( options ) {
		var type = options.model.type;
		
		// get constructor name by capitalising model type
		type = type.charAt( 0 ).toUpperCase() + type.slice( 1 );

		return new Anglebars.substrings[ type ]( options );
	}
};
// ViewModel constructor
Anglebars.ViewModel = function ( data ) {
	// Store data.
	this.data = data || {};

	// Create empty array for keypathes that can't be resolved initially
	this.pendingResolution = [];

	// Create empty object for observers
	this.observers = {};
};

Anglebars.ViewModel.prototype = {
	
	// Update the data model and notify observers
	set: function ( keypath, value ) {
		var k, keys, key, obj, i, unresolved, previous;

		// Allow multiple values to be set in one go
		if ( typeof keypath === 'object' ) {
			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					this.set( k, keypath[k] );
				}
			}

			return;
		}

		
		// Store previous value
		previous = this.get( keypath );

		// split key path into keys
		keys = Anglebars.utils.splitKeypath( keypath );

		obj = this.data;
		while ( keys.length > 1 ) {
			key = keys.shift();
			obj = obj[ key ] || {};
		}

		key = keys[0];

		obj[ key ] = value;

		if ( !Anglebars.utils.isEqual( previous, value ) ) {
			this.publish( keypath, value );
		}

		// see if we can resolve any of the unresolved keypaths (if such there be)
		i = this.pendingResolution.length;

		while ( i-- ) { // work backwards, so we don't go in circles
			unresolved = this.pendingResolution.splice( i, 1 )[0];
			this.getKeypath( unresolved.item, unresolved.item.model.partialKeypath, unresolved.item.contextStack, unresolved.callback );
		}
	},

	get: function ( keypath ) {
		var keys, result;

		if ( !keypath ) {
			return '';
		}

		keys = keypath.split( '.' );

		result = this.data;
		while ( keys.length ) {
			try {
				result = result[ keys.shift() ];
			} catch ( err ) {
				return '';
			}
			
			if ( result === undefined ) {
				return '';
			}
		}

		return result;
	},

	update: function ( keypath ) {
		var value = this.get( keypath );
		this.publish( keypath, value );
	},

	getKeypath: function ( item, partialKeypath, contextStack, callback ) {

		// TODO refactor this, it's fugly

		var keys, keysClone, innerMost, result, contextStackClone, keypath;

		contextStack = ( contextStack ? contextStack.concat() : [] );
		contextStackClone = contextStack.concat();

		// implicit iterators - i.e. {{.}} - are a special case
		if ( partialKeypath === '.' ) {
			item.keypath = ( contextStack[ contextStack.length - 1 ] );
			callback.call( item, item.keypath );
		}

		while ( contextStack ) {

			innerMost = ( contextStack.length ? contextStack[ contextStack.length - 1 ] : null );
			keys = ( innerMost ? innerMost.split( '.' ).concat( partialKeypath.split( '.' ) ) : partialKeypath.split( '.' ) );
			keysClone = keys.concat();

			result = this.data;
			while ( keys.length ) {
				try {
					result = result[ keys.shift() ];
				} catch ( err ) {
					result = undefined;
					break;
				}
			
				if ( result === undefined ) {
					break;
				}
			}

			if ( result !== undefined ) {
				keypath = keysClone.join( '.' );
				item.keypath = keypath;
				callback.call( item, keypath );
				break;
			}

			if ( contextStack.length ) {
				contextStack.pop();
			} else {
				contextStack = false;
			}
		}

		// if we didn't figure out the keypath, add this to the unresolved list
		if ( result === undefined ) {
			this.registerUnresolvedAddress( item, callback );
		}
	},

	registerUnresolvedAddress: function ( item, onResolve ) {
		this.pendingResolution[ this.pendingResolution.length ] = {
			item: item,
			callback: onResolve
		};
	},

	cancelAddressResolution: function ( item ) {
		if ( this.pendingResolution.filter ) { // non-shit browsers
			this.pendingResolution = this.pendingResolution.filter( function ( pending ) {
				return pending.item !== item;
			});
		}

		else { // IE (you utter, utter piece of shit)
			var i, filtered = [];

			for ( i=0; i<this.pendingResolution.length; i+=1 ) {
				if ( this.pendingResolution[i].item !== item ) {
					filtered[ filtered.length ] = this.pendingResolution[i];
				}
			}

			this.pendingResolution = filtered;
		}
	},

	publish: function ( keypath, value ) {
		var self = this, observersGroupedByLevel = this.observers[ keypath ] || [], i, j, priority, observer;

		for ( i=0; i<observersGroupedByLevel.length; i+=1 ) {
			priority = observersGroupedByLevel[i];

			if ( priority ) {
				for ( j=0; j<priority.length; j+=1 ) {
					observer = priority[j];

					if ( keypath !== observer.originalAddress ) {
						value = self.get( observer.originalAddress );
					}
					observer.callback( value );
				}
			}
		}
	},

	observe: function ( keypath, priority, callback ) {
		
		var self = this, originalAddress = keypath, observerRefs = [], observe;

		if ( !keypath ) {
			return undefined;
		}

		observe = function ( keypath ) {
			var observers, observer;

			observers = self.observers[ keypath ] = self.observers[ keypath ] || [];
			observers = observers[ priority ] = observers[ priority ] || [];

			observer = {
				callback: callback,
				originalAddress: originalAddress
			};

			observers[ observers.length ] = observer;
			observerRefs[ observerRefs.length ] = {
				keypath: keypath,
				priority: priority,
				observer: observer
			};
		};

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

		index = observers.indexOf( observerRef.observer );

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



(function ( A ) {

	'use strict';

	var view, views, utils;

	utils = A.utils;

	// View constructor factory
	view = A.view = function ( proto ) {
		var View;

		View = function ( options ) {
			
			var formatters      = options.model.formatters;

			this.model          = options.model;
			this.anglebars      = options.anglebars;
			this.viewmodel      = options.anglebars.viewmodel;
			this.parentNode     = options.parentNode;
			this.parentFragment = options.parentFragment;
			this.contextStack   = options.contextStack || [];
			this.anchor         = options.anchor;
			this.index          = options.index;

			this.initialize();

			this.viewmodel.getKeypath( this, options.model.partialKeypath, options.contextStack, function ( keypath ) {
				var value, formatted, self = this;

				value = this.viewmodel.get( keypath );
				this.update( this.anglebars._format( value, formatters ) );

				this.observerRefs = this.viewmodel.observe( keypath, this.model.priority, function ( value ) {
					self.update( self.anglebars._format( value, formatters ) );
					
					if ( self.bubble ) {
						self.bubble();
					}
				});
			});

			// if the last callback didn't run immediately (ie viewmodel.getKeypath didn't succeed)
			// we have a failed lookup. For inverted sections, we need to trigger this.update() so
			// the contents are rendered
			if ( !this.keypath && this.model.inverted ) { // test both section-hood and inverticity in one go
				this.update( false );
			}
		};

		View.prototype = proto;

		return View;
	};


	// View types
	views = A.views;


	// Plain text
	views.Text = function ( options ) {
		this.node = document.createTextNode( options.model.text );
		this.index = options.index;

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		options.parentNode.insertBefore( this.node, options.anchor );
	};

	views.Text.prototype = {
		teardown: function () {
			utils.remove( this.node );
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Interpolator
	views.Interpolator = view({
		initialize: function () {
			this.node = document.createTextNode( '' );

			this.parentNode.insertBefore( this.node, this.anchor || null );
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				this.viewmodel.cancelAddressResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}

			utils.remove( this.node );
		},

		update: function ( value ) {
			this.node.data = value;
		},

		firstNode: function () {
			return this.node;
		}
	});


	// Triple
	views.Triple = view({
		initialize: function () {
			this.nodes = [];

			// this.tripleAnchor = Anglebars.utils.createAnchor();
			// this.parentNode.insertBefore( this.tripleAnchor, this.anchor || null );
		},

		teardown: function () {
			
			// remove child nodes from DOM
			while ( this.nodes.length ) {
				utils.remove( this.nodes.shift() );
			}

			// kill observer(s)
			if ( !this.observerRefs ) {
				this.viewmodel.cancelAddressResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}

			utils.remove( this.anchor );
		},

		firstNode: function () {
			if ( this.nodes[0] ) {
				return this.nodes[0];
			}

			return this.parentFragment.findNextNode( this );
		},

		update: function ( value ) {
			var numNodes, i, anchor;

			// TODO... not sure what's going on here? this.value isn't being set to value,
			// and equality check should already have taken place. Commenting out for now
			// if ( utils.isEqual( this.value, value ) ) {
			// 	return;
			// }

			anchor = ( this.initialised ? this.parentFragment.findNextNode( this ) : this.anchor );

			// remove existing nodes
			numNodes = this.nodes.length;
			for ( i=0; i<numNodes; i+=1 ) {
				utils.remove( this.nodes[i] );
			}

			// get new nodes
			this.nodes = utils.getNodeArrayFromHtml( value, false );

			numNodes = this.nodes.length;
			if ( numNodes ) {
				anchor = this.parentFragment.findNextNode( this );
			}
			for ( i=0; i<numNodes; i+=1 ) {
				this.parentNode.insertBefore( this.nodes[i], anchor );
			}

			this.initialised = true;
		}
	});


	// Element
	views.Element = function ( options ) {

		var i,
			numAttributes,
			numItems,
			attributeModel,
			item,
			binding,
			model;

		// stuff we'll need later
		model = this.model = options.model;
		this.viewmodel = options.anglebars.viewmodel;
		this.parentFragment = options.parentFragment;
		this.index = options.index;

		// create the DOM node
		if ( model.namespace ) {
			this.node = document.createElementNS( model.namespace, model.tag );
		} else {
			this.node = document.createElement( model.tag );
		}

		
		// set attributes
		this.attributes = [];
		numAttributes = model.attributes.length;
		for ( i=0; i<numAttributes; i+=1 ) {
			attributeModel = model.attributes[i];

			// if the attribute name is data-bind, and this is an input or textarea, set up two-way binding
			if ( attributeModel.name === 'data-bind' && ( model.tag === 'INPUT' || model.tag === 'TEXTAREA' ) ) {
				binding = attributeModel.value;
			}

			// otherwise proceed as normal
			else {
				this.attributes[i] = new views.Attribute( attributeModel, options.anglebars, this.node, options.contextStack );
			}
		}

		if ( binding ) {
			this.bind( binding, options.anglebars.lazy );
		}

		// append children
		this.children = new views.Fragment({
			model:        model.children,
			anglebars:    options.anglebars,
			parentNode:   this.node,
			contextStack: options.contextStack,
			anchor:       null
		});

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		options.parentNode.insertBefore( this.node, options.anchor );
	};

	views.Element.prototype = {
		bind: function ( keypath, lazy ) {
			
			var viewmodel = this.viewmodel, node = this.node, setValue;

			setValue = function () {
				var value = node.value;
				
				// special cases
				if ( value === '0' ) {
					value = 0;
				}

				else if ( value !== '' ) {
					value = +value || value;
				}

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
			
			var numAttrs, i;

			this.children.teardown();

			numAttrs = this.attributes.length;
			for ( i=0; i<numAttrs; i+=1 ) {
				this.attributes[i].teardown();
			}

			utils.remove( this.node );
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Section
	views.Section = view({
		initialize: function () {
			this.views = [];
			this.length = 0; // number of times this section is rendered
		},

		teardown: function () {
			this.unrender();

			if ( !this.observerRefs ) {
				this.viewmodel.cancelAddressResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}

			utils.remove( this.anchor );
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


			fragmentOptions = {
				model:        this.model.children,
				anglebars:    this.anglebars,
				parentNode:   this.parentNode,
				anchor:       this.parentFragment.findNextNode( this ),
				parentSection: this
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

						this.views[0] = new views.Fragment( fragmentOptions );
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
						viewsToRemove.shift().teardown();
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
							// append list item to context stack
							fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
							fragmentOptions.index = i;

							this.views[i] = new views.Fragment( fragmentOptions );
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

					this.views[0] = new views.Fragment( fragmentOptions );
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

						this.views[0] = new views.Fragment( fragmentOptions );
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


	// Fragment
	views.Fragment = function ( options ) {

		var numModels, i, itemOptions;

		this.parentSection = options.parentSection;
		this.index = options.index;

		itemOptions = {
			anglebars:      options.anglebars,
			parentNode:     options.parentNode,
			contextStack:   options.contextStack,
			anchor:         options.anchor,
			parentFragment: this
		};

		this.items = [];

		numModels = options.model.length;
		for ( i=0; i<numModels; i+=1 ) {
			itemOptions.model = options.model[i];
			itemOptions.index = i;

			this.items[i] = views.create( itemOptions );
		}
	};

	views.Fragment.prototype = {
		teardown: function () {
			
			var i, numItems;

			numItems = this.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				this.items[i].teardown();
			}

			delete this.items;
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


	// Attribute
	views.Attribute = function ( model, anglebars, parentNode, contextStack ) {
	
		var i, numComponents;

		// if it's just a straight key-value pair, with no mustache shenanigans, set the attribute accordingly
		if ( !model.isDynamic ) {
			parentNode.setAttribute( model.name, model.value );
			return;
		}

		// otherwise we need to do some work
		this.parentNode = parentNode;
		this.name = model.name;

		this.substrings = [];

		numComponents = model.components.length;
		for ( i=0; i<numComponents; i+=1 ) {
			this.substrings[i] = A.substrings.create({
				model: model.components[i],
				anglebars: anglebars,
				parent: this,
				contextStack: contextStack
			});
		}

		// manually trigger first update
		this.update();
	};

	views.Attribute.prototype = {
		teardown: function () {
			var numSubstrings, i, substring;

			// ignore non-dynamic attributes
			if ( !this.substrings ) {
				return;
			}

			numSubstrings = this.substrings.length;
			for ( i=0; i<numSubstrings; i+=1 ) {
				substring = this.substrings[i];

				if ( substring.teardown ) {
					substring.teardown();
				}
			}
		},

		bubble: function () {
			this.update();
		},

		update: function () {
			this.value = this.toString();
			this.parentNode.setAttribute( this.name, this.value );
		},

		toString: function () {
			var string = '', i, numSubstrings, substring;

			numSubstrings = this.substrings.length;
			for ( i=0; i<numSubstrings; i+=1 ) {
				substring = this.substrings[i];
				string += substring.toString();
			}

			return string;
		}
	};

}( Anglebars ));

(function ( A ) {

	'use strict';

	var substring, substrings;

	// Substring constructor factory
	substring = A.substring = function ( proto ) {
		var Substring;

		Substring = function ( options ) {
			
			var model, formatters;

			model = this.model = options.model;
			this.anglebars = options.anglebars;
			this.viewmodel = options.anglebars.viewmodel;
			this.parent = options.parent;
			this.contextStack = options.contextStack || [];

			formatters = options.model.formatters;

			// if there is an init method, call it
			this.initialize && this.initialize();

			this.viewmodel.getKeypath( this, model.partialKeypath, options.contextStack, function ( keypath ) {
				var value, self = this;

				value = this.viewmodel.get( keypath );
				this.update( options.anglebars._format( value, formatters ) );

				this.observerRefs = this.viewmodel.observe( keypath, this.model.priority, function ( value ) {
					self.update( options.anglebars._format( value, formatters ) );
				});
			});
		};

		Substring.prototype = proto;

		return Substring;
	};


	// Substring types
	substrings = A.substrings;

	// Plain text
	substrings.Text = function ( options ) {
		this.text = options.model.text;
	};

	substrings.Text.prototype = {
		toString: function () {
			return this.text;
		},

		teardown: function () {} // no-op
	};


	// Interpolator or Triple
	substrings.Interpolator = substring({
		update: function ( value ) {
			this.value = value;
			this.parent.bubble();
		},

		bubble: function () {
			this.parent.bubble();
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				this.viewmodel.cancelAddressResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		toString: function () {
			return this.value || '';
		}
	});

	// Triples are the same as Interpolators in this context
	substrings.Triple = substrings.Interpolator;


	// Section
	substrings.Section = substring({
		initialize: function () {
			this.substrings = [];
			this.length = 0;
		},

		teardown: function () {
			this.unrender();

			if ( !this.observerRefs ) {
				this.viewmodel.cancelAddressResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		unrender: function () {
			while ( this.substrings.length ) {
				this.substrings.shift().teardown();
			}
			this.length = 0;
		},

		bubble: function () {
			this.value = this.substrings.join( '' );
			this.parent.bubble();
		},

		update: function ( value ) {
			var emptyArray, i, substringsToRemove;

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
						this.substrings[0] = new substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack );
						this.length = 1;
					}
				}

				this.value = this.substrings.join( '' );
				this.parent.bubble();

				return;
			}


			// Otherwise we need to work out what sort of section we're dealing with.
			if( typeof value === 'object' ) {
				


				// if value is an array, iterate through
				if ( A.utils.isArray( value ) ) {

					// if the array is shorter than it was previously, remove items
					if ( value.length < this.length ) {
						substringsToRemove = this.substrings.splice( value.length, this.length - value.length );

						while ( substringsToRemove.length ) {
							substringsToRemove.shift().teardown();
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
								this.substrings[i] = new substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack.concat( this.keypath + '.' + i ) );
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
						this.substrings[0] = new substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack.concat( this.keypath ) );
						this.length = 1;
					}
				}
			}

			// otherwise render if value is truthy, unrender if falsy
			else {

				if ( value && !emptyArray ) {
					if ( !this.length ) {
						this.substrings[0] = new substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack );
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

			this.value = this.substrings.join( '' );
			this.parent.bubble();
		},

		toString: function () {
			return this.value || '';
		}
	});


	// Fragment
	substrings.Fragment = function ( options ) {
		var numItems, i, itemOptions;

		this.parent = options.parent;
		this.items = [];

		itemOptions = {
			anglebars:    options.anglebars,
			parent:       this,
			contextStack: options.contextStack
		};
		
		numItems = options.models.length;
		for ( i=0; i<numItems; i+=1 ) {
			itemOptions.model = this.models[i];
			this.items[ this.items.length ] = substrings.create( itemOptions );
		}

		this.value = this.items.join('');
	};

	substrings.Fragment.prototype = {
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
			return this.value || '';
		}
	};

}( Anglebars ));

