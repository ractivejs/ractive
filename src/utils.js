(function ( Anglebars, document ) {
	
	'use strict';

	var utils = Anglebars.utils,
		whitespace = /^\s*\n\r?\s*$/;


	// Remove node from DOM if it exists
	utils.remove = function ( node ) {
		if ( node.parentNode ) {
			node.parentNode.removeChild( node );
		}
	};


	// Strip whitespace from the start and end of strings
	utils.trim = function ( text ) {
		var trimmed = text.replace( /^\s+/, '' ).replace( /\s+$/, '' );
		return trimmed;
	};


	// convert HTML to an array of DOM nodes
	utils.getNodeArrayFromHtml = function ( html, replaceSrcAttributes ) {

		var parser, doc, temp, i, numNodes, nodes = [], attrs, pattern;

		// replace src attribute with data-anglebars-src
		if ( replaceSrcAttributes ) {
			attrs = [ 'src', 'poster' ];

			for ( i=0; i<attrs.length; i+=1 ) {
				pattern = new RegExp( '(<[^>]+\\s)(' + attrs[i] + '=)', 'g' );
				html = html.replace( pattern, '$1data-anglebars-' + attrs[i] + '=' );
			}
		}

		if ( document.implementation && document.implementation.createDocument ) {
			doc = document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null);
			temp = document.createElementNS("http://www.w3.org/1999/xhtml", "body");
		} else {
			// IE. ugh
			temp = document.createElement( 'div' );
		}
		
		temp.innerHTML = html;


		// create array from node list, as node lists have some undesirable properties
		numNodes = temp.childNodes.length;
		for ( i=0; i<numNodes; i+=1 ) {
			nodes[i] = temp.childNodes[i];
		}

		return nodes;
	};


	// Returns the specified DOM node
	utils.getEl = function ( input ) {
		var output;

		if ( !input ) {
			throw new Error( 'No container element specified' );
		}

		// We already have a DOM node - no work to do
		if ( input instanceof HTMLElement ) {
			return input;
		}

		// Get node from string
		if ( typeof input === 'string' ) {
			output = document.getElementById( input );

			if ( output instanceof HTMLElement ) {
				return output;
			}
		}

		throw new Error( 'Could not find container element' );
	};


	// Split partialKeypath ('foo.bar.baz[0]') into keys (['foo', 'bar', 'baz', 0])
	utils.splitKeypath = function ( keypath ) {
		var firstPass, secondPass = [], numKeys, key, i, startIndex, pattern, match;

		// Start by splitting on periods
		firstPass = keypath.split( '.' );

		// Then see if any keys use array notation instead of dot notation
		for ( i=0; i<firstPass.length; i+=1 ) {
			secondPass = secondPass.concat( utils.parseArrayNotation( firstPass[i] ) );
		}

		return secondPass;
	};

	// Split key with array notation ('baz[0]') into identifier and array pointer(s) (['baz', 0])
	utils.parseArrayNotation = function ( key ) {
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
	};


	// strip mustache comments (which look like {{!this}}, i.e. mustache with an exclamation mark) from a string
	utils.stripComments = function ( input ) {
		var comment = /\{\{!\s*[\s\S]+?\s*\}\}/g,
			lineComment = /(^|\n|\r\n)\s*\{\{!\s*[\s\S]+?\s*\}\}\s*($|\n|\r\n)/g,
			output;

		// remove line comments
		output = input.replace( lineComment, function ( matched, startChar, endChar, start, complete ) {
			return startChar;
		});

		// remove inline comments
		output = output.replace( comment, '' );

		return output;
	};


	// create an anglebars anchor
	utils.createAnchor = function () {
		var anchor = document.createElement( 'a' );
		anchor.setAttribute( 'class', 'anglebars-anchor' );

		return anchor;
	};


	// convert a node list to an array (iterating through a node list directly often has... undesirable results)
	utils.nodeListToArray = function ( nodes ) {
		var i, numNodes = nodes.length, result = [];

		for ( i=0; i<numNodes; i+=1 ) {
			result[i] = nodes[i];
		}

		return result;
	};


	// convert an attribute list to an array
	utils.attributeListToArray = function ( attributes ) {
		var i, numAttributes = attributes.length, result = [];

		for ( i=0; i<numAttributes; i+=1 ) {
			result[i] = {
				name: attributes[i].name,
				value: attributes[i].value
			};
		}

		return result;
	};


	// find the first mustache in a string, and store some information about it. Returns an array with some additional properties
	utils.findMustache = function ( text, startIndex ) {

		var match, split, mustache, formulaSplitter, i, formatterNameAndArgs, formatterPattern, formatterName, formatterArgs, formatter, fn, args;

		mustache = /(\{)?\{\{(#|\^|\/)?(\>)?(&)?\s*([\s\S]+?)\s*\}\}(\})?/g;
		formulaSplitter = ' | ';
		formatterPattern = /([a-zA-Z_$][a-zA-Z_$0-9]*)(\[[^\]]*\])?/;

		match = utils.findMatch( text, mustache, startIndex );

		if ( match ) {

			match.formula = match[5];
			split = match.formula.split( formulaSplitter );
			match.partialKeypath = split.shift();
			
			// extract formatters
			//if ( split.length ) {
				match.formatters = [];
			//}

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
			// match.formatters = split;
			
			
			// figure out what type of mustache we're dealing with
			if ( match[2] ) {
				// mustache is a section
				match.type = 'section';
				match.inverted = ( match[2] === '^' ? true : false );
				match.closing = ( match[2] === '/' ? true : false );
			}

			else if ( match[3] ) {
				match.type = 'partial';
			}

			else if ( match[1] ) {
				// left side is a triple - check right side is as well
				if ( !match[6] ) {
					return false;
				}

				match.type = 'triple';
			}

			else {
				match.type = 'interpolator';
			}

			match.isMustache = true;
			return match;
		}

		// if no mustache found, report failure
		return false;
	};


	// find the first match of a pattern within a string. Returns an array with start and end properties indicating where the match was found within the string
	utils.findMatch = function ( text, pattern, startIndex ) {

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
	};


	
	utils.getStubsFromNodes = function ( nodes ) {
		var i, numNodes, node, result = [];

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
				result = result.concat( utils.expandText( node.data ) );
			}
		}

		return result;
	};

	utils.expandText = function ( text ) {
		var result, mustache;

		// see if there's a mustache involved here
		mustache = utils.findMustache( text );

		// if not, groovy - no work to do
		if ( !mustache ) {
			return {
				type: 'text',
				text: text
			};
		}

		result = [];

		// otherwise, see if there is any text before the node
		if ( mustache.start > 0 ) {
			result[ result.length ] = {
				type: 'text',
				text: text.substr( 0, mustache.start )
			};
		}

		// add the mustache
		result[ result.length ] = {
			type: 'mustache',
			mustache: mustache
		};

		if ( mustache.end < text.length ) {
			result = result.concat( utils.expandText( text.substring( mustache.end ) ) );
		}

		return result;
	};

	utils.setText = function ( textNode, text ) {

		if ( textNode.textContent !== undefined ) { // standards-compliant browsers
			textNode.textContent = text;
		}

		else { // redmond troglodytes
			textNode.data = text;
		}
	};

	// borrowed wholesale from underscore... TODO include license? write an Anglebars-optimised version?
	utils.isEqual = function ( a, b ) {
		
		var eq = function ( a, b, stack ) {

			var toString = Object.prototype.toString;
			
			// Identical objects are equal. `0 === -0`, but they aren't identical.
			// See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
			if (a === b) return a !== 0 || 1 / a == 1 / b;
			
			// A strict comparison is necessary because `null == undefined`.
			if (a == null || b == null) return a === b;
			
			// Compare `[[Class]]` names.
			var className = toString.call( a );
			if ( className != toString.call( b ) ) return false;
			
			switch ( className ) {
				// Strings, numbers, dates, and booleans are compared by value.
				case '[object String]':
					// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
					// equivalent to `new String("5")`.
					return a == String( b );
				
				case '[object Number]':
					// `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
					// other numeric values.
					return a != +a ? b != +b : ( a == 0 ? 1 / a == 1 / b : a == +b );
				
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

			if ( typeof a != 'object' || typeof b != 'object' ) return false;
			
			// Assume equality for cyclic structures. The algorithm for detecting cyclic
			// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
			var length = stack.length;
			
			while ( length-- ) {
				// Linear search. Performance is inversely proportional to the number of
				// unique nested structures.
				if ( stack[length] == a ) return true;
			}
			
			// Add the first object to the stack of traversed objects.
			stack.push( a );

			var size = 0, result = true;
			// Recursively compare objects and arrays.
			
			if ( className == '[object Array]' ) {
				// Compare array lengths to determine if a deep comparison is necessary.
				size = a.length;
				result = size == b.length;
				if ( result ) {
					// Deep compare the contents, ignoring non-numeric properties.
					while ( size-- ) {
					// Ensure commutative equality for sparse arrays.
						if ( !( result = size in a == size in b && eq( a[ size ], b[ size ], stack ) ) ) break;
					}
				}
			} else {
				// Objects with different constructors are not equivalent.
				if ( 'constructor' in a != 'constructor' in b || a.constructor != b.constructor ) return false;
				
				// Deep compare objects.
				for ( var key in a ) {
					if ( a.hasOwnProperty( key ) ) {
						// Count the expected number of properties.
						size++;
						// Deep compare each member.
						if ( !( result = b.hasOwnProperty( key ) && eq( a[ key ], b[ key ], stack ) ) ) break;
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
	};

	// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
	utils.isArray = function ( obj ) {
		return Object.prototype.toString.call( obj ) === '[object Array]';
	};

	utils.compileStubs = function ( stubs, priority, namespace, preserveWhitespace ) {
		var compiled, next, processIntermediary;

		compiled = [];

		
		processIntermediary = function ( i ) {
			var mustache, item, text, element, stub, sliceStart, sliceEnd, nesting, bit, partialKeypath;

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
							throw new Error( 'Error compiling template' );
					}
					break;

				default:
					throw new Error( 'Error compiling template' );
			}
		};

		next = 0;
		while ( next < stubs.length ) {
			next = processIntermediary( next );
		}

		return compiled;
	};

	utils.processElementStub = function ( stub, priority, namespace ) {
		var proxy, attributes, numAttributes, attribute, i, node;

		node = stub.original;

		proxy = {
			type: 'element',
			tag: node.tagName,
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
	};

	utils.processAttribute = function ( name, value, priority ) {
		var attribute, components;

		components = utils.expandText( value );

		attribute = {
			name: name.replace( 'data-anglebars-', '' )
		};

		// no mustaches in this attribute - no extra work to be done
		if ( !utils.findMustache( value ) ) {
			attribute.value = value;
			return attribute;
		}


		// mustaches present - attribute is dynamic
		attribute.isDynamic = true;
		attribute.priority = priority;
		attribute.components = utils.compileStubs( components, priority, null );


		return attribute;
	};



}( Anglebars, document ));

