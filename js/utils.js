/*jslint white: true */
/*global Anglebars, _, document */


(function ( Anglebars, _, document ) {
	
	'use strict';

	var utils = Anglebars.utils;

	_.extend( utils, {
		// replacement for the dumbass DOM equivalent
		insertBefore: function ( referenceNode, newNode ) {
			if ( !referenceNode ) {
				throw new Error( 'Can\'t insert before a non-existent node' );
			}

			return referenceNode.parentNode.insertBefore( newNode, referenceNode );
		},

		insertAfter: function ( referenceNode, newNode ) {
			if ( !referenceNode ) {
				throw new Error( 'Can\'t insert before a non-existent node' );
			}

			return referenceNode.parentNode.insertBefore( newNode, referenceNode.nextSibling );
		},

		remove: function ( node ) {
			if ( node.parentNode ) {
				node.parentNode.removeChild( node );
			}
		},

		trim: function ( text ) {
			var trimmed = text.replace( /^\s+/, '' ).replace( /\s+$/, '' );
			return trimmed;
		},

		getNodeArrayFromHtml: function ( innerHTML ) {

			var parser, temp, i, numNodes, nodes = [];

			// test for DOMParser support
			// TODO

			temp = document.createElement( 'div' );
			temp.innerHTML = innerHTML;

			// create array from node list, as node lists have some undesirable properties
			numNodes = temp.childNodes.length;
			for ( i=0; i<numNodes; i+=1 ) {
				nodes[i] = temp.childNodes[i];
			}

			return nodes;
		},

		getEl: function ( input ) {
			var output;

			if ( input ) {
				// string
				if ( typeof input === 'string' ) {
					// see if it's a DOM node
					output = document.getElementById( input );

					if ( !output && document.querySelector ) {
						try {
							output = document.querySelector( input );
						} catch ( error ) {
							// somebody do something!
						}
					}
				}

				// jQuery (or equivalent) object
				else if ( input[0] && input[0].nodeType ) {
					output = input[0].innerHTML;
				}
			}

			return output;
		},

		stripComments: function ( input ) {
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
		},

		createAnchor: function () {
			var anchor = document.createElement( 'a' );
			anchor.setAttribute( 'class', 'anglebars-anchor' );

			return anchor;
		},

		nodeListToArray: function ( nodes ) {
			var i, numNodes = nodes.length, result = [];

			for ( i=0; i<numNodes; i+=1 ) {
				result[i] = nodes[i];
			}

			return result;
		},

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

		findMustache: function ( text, startIndex ) {

			var match, split, mustache, formulaSplitter;

			mustache = /(\{)?\{\{(#|\^|\/)?(\>)?(&)?\s*([\s\S]+?)\s*\}\}(\})?/g;
			formulaSplitter = ' | ';

			match = utils.findMatch( text, mustache, startIndex );

			if ( match ) {

				match.formula = match[5];
				split = match.formula.split( formulaSplitter );
				match.keypath = split.shift();
				match.formatters = split;
				
				
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
		},

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

		expandNodes: function ( nodes ) {
			var i, numNodes, node, result = [];

			numNodes = nodes.length;
			for ( i=0; i<numNodes; i+=1 ) {
				node = nodes[i];

				if ( node.nodeType !== 3 ) {
					result[ result.length ] = {
						type: 'element',
						original: node
					};
				}

				else {
					result = result.concat( utils.expandText( node.textContent ) );
				}
			}

			return result;
		},

		expandText: function ( text ) {
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
		}
	});

}( Anglebars, _, document ));