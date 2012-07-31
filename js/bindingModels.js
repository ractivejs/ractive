/*jslint white: true, nomen: true */
/*global document, _, bindingViews */

var bindingModels = (function ( _, views ) {

	'use strict';

	var models = {},
		insertBefore,
		insertAfter,
		remove,
		nodeListToArray,
		expandNodes,
		expandText,
		comment,
		lineComment,
		mustache,
		formulaSplitter,
		attributeListToArray,
		findMustache,
		findMatch,
		SECTION,
		INTERPOLATOR,
		TRIPLE,
		PARTIAL;



	insertBefore = function ( referenceNode, newNode ) {
		if ( !referenceNode ) {
			throw new Error( 'Can\'t insert before a non-existent node' );
		}

		return referenceNode.parentNode.insertBefore( newNode, referenceNode );
	};

	insertAfter = function ( referenceNode, newNode ) {
		if ( !referenceNode ) {
			throw new Error( 'Can\'t insert before a non-existent node' );
		}

		return referenceNode.parentNode.insertBefore( newNode, referenceNode.nextSibling );
	};

	remove = function ( node ) {
		if ( node.parentNode ) {
			node.parentNode.removeChild( node );
		}
	};

	nodeListToArray = function ( nodes ) {
		var i, numNodes = nodes.length, result = [];

		for ( i=0; i<numNodes; i+=1 ) {
			result[i] = nodes[i];
		}

		return result;
	};

	attributeListToArray = function ( attributes ) {
		var i, numAttributes = attributes.length, result = [];

		for ( i=0; i<numAttributes; i+=1 ) {
			result[i] = {
				name: attributes[i].name,
				value: attributes[i].value
			};
		}

		return result;
	};

	findMustache = function ( text, startIndex ) {

		var match, split;

		match = findMatch( text, mustache, startIndex );

		if ( match ) {

			match.formula = match[4];
			split = match.formula.split( formulaSplitter );
			match.keypath = split.shift();
			match.formatters = split;
			
			
			// figure out what type of mustache we're dealing with
			if ( match[2] ) {
				// mustache is a section
				match.type = SECTION;
				match.inverted = ( match[2] === '^' ? true : false );
				match.closing = ( match[2] === '/' ? true : false );
			}

			else if ( match[3] ) {
				match.type = PARTIAL;
			}

			else if ( match[1] ) {
				// left side is a triple - check right side is as well
				if ( !match[5] ) {
					return false;
				}

				match.type = TRIPLE;
			}

			else {
				match.type = INTERPOLATOR;
			}

			match.isMustache = true;
			return match;
		}

		// if no mustache found, report failure
		else {
			return false;
		}
	};

	findMatch = function ( text, pattern, startIndex ) {

		var match;

		// reset lastIndex
		if ( pattern.global ) {
			pattern.lastIndex = startIndex || 0;
		} else {
			console.warn( 'findMatch() will work incorrectly if supplied a non-global regex' );
		}

		match = pattern.exec( text );

		if ( match ) {
			match.end = pattern.lastIndex;
			match.start = ( match.end - match[0].length );
			return match;
		}
	};

	expandNodes = function ( nodes ) {
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
				result = result.concat( expandText( node.textContent ) );
			}
		}

		return result;
	};

	expandText = function ( text ) {
		var result, mustache;

		// see if there's a mustache involved here
		mustache = findMustache( text );

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
			result = result.concat( expandText( text.substring( mustache.end ) ) );
		}

		return result;
	};


	formulaSplitter = ' | ';

	comment = /\{\{!\s*([\s\S]+?)\s*\}\}/g;
	lineComment = /^\s*\{\{!\s*([\s\S]+?)\s*\}\}\s*$/g;
	mustache = /(\{)?\{\{(#|\^|\/)?(\>)?\s*([\s\S]+?)\s*\}\}(\})?/g;


	SECTION = 'section';
	INTERPOLATOR = 'interpolator';
	TRIPLE = 'triple';
	PARTIAL = 'partial';



	models.Section = function ( mustache, expandedNodes, parent ) {

		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.parent = parent;
		this.level = parent.level + 1;
		this.binding = parent.binding;

		this.list = new models.List( expandedNodes, this );
	};

	models.Section.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Section( this, parentNode, contextStack, anchor );
		}
	};

	/*models.Section = function ( mustache, expandedNodes, parent ) {
		
		var text, firstNode;

		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.parent = parent;
		this.level = parent.level + 1;
		this.binding = parent.binding;
		if ( !this.binding ) {
			console.warn( 'no binding for ', this );
		}

		this.instances = [];
		this.nodes = [];
		text = node.textContent;

		this.nesting = 1;
		this.subscriptionRefs = [];

		// if there is text in the next node after the section start, that becomes the first node in the section
		if ( mustache.end < text.length ) {
			firstNode = insertAfter( node, document.createTextNode( text.substring( mustache.end ) ) );
		}

		// otherwise, the first node in the section is the original text node's next sibling
		else {
			firstNode = node.nextSibling;
		}


		// if the section start tag isn't the first thing in the text node, add the preceding text before the section
		text = node.textContent;
		if ( mustache.start > 0 ) {
			node.textContent = text.substr( 0, mustache.start );
			new models.Text( node, parent );
		}

		// otherwise, discard the original node
		else {
			remove( node );
		}


		// get all the nodes in the section, create a list from them
		this.populate( firstNode );
		this.list = new models.List( this.nodes, this );

		// add the section
		parent.add( this );
	};*/

	/*models.Section.prototype = {
		populate: function ( firstNode ) {

			var currentNode, nextNode, text, remainder, nestedStart, sectionEnd, match, index, add;

			add = _.bind( function ( node ) {
				this.nodes[ this.nodes.length ] = node;
			}, this );

			nestedStart = new RegExp( '\\{\\{(#|\\^)s*' + this.keypath + '[\\s\\S]*?\\}\\}', 'g' );
			sectionEnd = new RegExp( '\\{\\{\\/\\s*' + this.keypath + '\\s*\\}\\}', 'g' );

			currentNode = firstNode;

			while ( currentNode ) {
				
				// nextNode = currentNode.nextSibling;

				// if there are no more sibling nodes, and no anchor, it means the section is illegal
				if ( !currentNode && !this.anchor ) {
					throw new Error( 'Illegal section (' + this.keypath + ')' );
				}

				// see if the next node is a text node containing the section end tag
				if ( currentNode.nodeType === 3 ) {
					
					text = currentNode.textContent;

					// but first check there are no more similar start tags
					// (i.e. don't just match the first end tag, or situations
					// like {{ #a }}{{ #a }}{{ /a }}{{ /a }} will cause chaos)
					index = 0;
					while ( match = findMatch( text, nestedStart, index ) ) {
						this.nesting += 1;
						index = match.end;
					}

					match = findMatch( text, sectionEnd );

					if ( match ) {
						// ladies and gentlemen, we have a winner

						this.nesting -= 1;
						
						// only end here if we're back up to the level we started at
						if ( !this.nesting ) {

							// if there is any text after the tag, preserve it
							if ( match.end < text.length ) {
								remainder = text.substring( match.end );
								this.next = insertAfter( currentNode, document.createTextNode( remainder ) );
							} else {
								this.next = currentNode.nextSibling;
							}


							if ( match.start > 0 ) {
								// if there is any text before the tag, preserve that too
								currentNode.textContent = text.substr( 0, match.start );
								add( currentNode );
							} else {
								// otherwise, remove it
								remove( currentNode );
							}

							return;
						}

						else {
							add( currentNode );
						}
					}

					else {
						add( currentNode );
					}
				}

				else {
					add( currentNode );
				}

				// set up next iteration
				currentNode = currentNode.nextSibling;
			}
		},

		render: function ( parentNode, contextStack, anchor ) {
			return new views.Section( this, parentNode, contextStack, anchor );
		}
	};*/

	models.getListFromNodes = function ( nodes, parent ) {
		

		return new models.List( expandNodes( nodes ), parent );
	};


	models.List = function ( expandedNodes, parent ) {
		this.expanded = expandedNodes;
		this.parent = parent;
		this.level = parent.level + 1;
		this.binding = parent.binding;
		this.contextStack = parent.contextStack;

		if ( !expandedNodes ) {
			throw new Error( 'no expanded nodes' );
		}

		this.compile();
	};

	models.List.prototype = {
		add: function ( item ) {
			this.items[ this.items.length ] = item;
		},

		compile: function () {
			var next;

			// create empty children array
			this.items = [];

			// walk through the list of child nodes, building sections as we go
			next = 0;
			while ( next < this.expanded.length ) {
				next = this.createItem( next );
			}
		},

		createItem: function ( i ) {
			var mustache, item, text, element, start, sliceStart, sliceEnd, nesting, bit, keypath;

			start = this.expanded[i];

			switch ( start.type ) {
				case 'text':
					this.add( new models.Text( start.text, this ) );
					return i+1;

				case 'element':
					this.add( new models.Element( start.original, this ) );
					return i+1;

				case 'mustache':
					
					switch ( start.mustache.type ) {
						case SECTION:

							i += 1;
							sliceStart = i; // first item in section
							keypath = start.mustache.keypath;
							nesting = 0;

							// find end
							while ( ( i < this.expanded.length ) && !sliceEnd ) {
								
								bit = this.expanded[i];

								if ( bit.type === 'mustache' ) {
									if ( bit.mustache.type === 'section' && bit.mustache.keypath === keypath ) {
										if ( !bit.mustache.closing ) {
											nesting += 1;
										}

										else {
											if ( !nesting ) {
												sliceEnd = i;
											}
										}
									}
								}

								i += 1;
							}

							if ( !sliceEnd ) {
								throw new Error( 'Illegal section "' + keypath + '"' );
							}

							this.add( new models.Section( start.mustache, this.expanded.slice( sliceStart, sliceEnd ), this ) );
							return i;


						case TRIPLE:

							this.add( new models.Triple( start.mustache, this ) );
							return i+1;


						case INTERPOLATOR:

							this.add( new models.Interpolator( start.mustache, this ) );
							return i+1;

						default:

							console.warn( 'errr...' );
							return i+1;
					}
					break;

				default:
					console.warn( 'errr...' );
					break;
			}



			/*// see if we're dealing with a text node
			if ( node.nodeType === 3 ) {
				text = node.textContent;

				mustache = findMustache( text );

				// if there are no mustaches in this text node, we don't need to do very much
				if ( !mustache ) {
					item = new models.Text( node, this );
					return item.next;
				}

				switch ( mustache.type ) {
					case SECTION:
						item = new models.Section( mustache, node, this );
						return item.next;

					case TRIPLE:
						item = new models.Triple( mustache, node, this );
						return item.next;

					case INTERPOLATOR:
						item = new models.Interpolator( mustache, node, this );
						return item.next;

					default:
						console.warn( 'Unsupported mustache type' );
						return node.nextSibling;
				}
			}

			// it's an element node
			else if ( node.nodeType === 1 ) {
				item = new models.Element( node, this );
				return item.next;
			}

			else {
				console.warn( 'errr...' );
				console.log( node, node.nodeType );
				return node.nextSibling;
			}*/
		},

		render: function ( parentNode, contextStack, anchor ) {
			return new views.List( this, parentNode, contextStack, anchor );
		}
	};

	models.Text = function ( text, parent ) {
		this.text = text;

		if ( /^\s+$/.test( text ) || text === '' ) {
			if ( !parent.binding.preserveWhitespace ) {
				return; // don't bother keeping this if it only contains whitespace, unless that's what the user wants
			}
		}
	};

	models.Text.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Text( this, parentNode, contextStack, anchor );
		}
	};

	models.Interpolator = function ( mustache, parent ) {
		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.binding = parent.binding;
		this.level = parent.level + 1;
	};

	models.Interpolator.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Interpolator( this, parentNode, contextStack, anchor );
		}
	};

	models.Triple = function ( mustache, parent ) {
		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.binding = parent.binding;
		this.level = parent.level + 1;
	};

	models.Triple.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Triple( this, parentNode, contextStack, anchor );
		}
	};

	models.Element = function ( original, parent ) {
		this.type = original.tagName;
		this.parent = parent;
		this.binding = parent.binding;


		if ( original.childNodes.length ) {
			this.children = new models.List( expandNodes( original.childNodes ), this );
		}
	};

	models.Element.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Element( this, parentNode, contextStack, anchor );
		}
	};

	/*models.Interpolator = function ( mustache, node, parent ) {
		
		var text;

		text = node.textContent;

		this.parent = parent;

		// get keypath and context stack etc
		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.contextStack = parent.contextStack;
		this.binding = parent.binding;
		this.level = parent.level + 1;

		// if the interpolator isn't the first thing in this text node, preserve what came before
		if ( mustache.start > 0 ) {
			node.textContent = text.substr( 0, mustache.start );
			new models.Text( node, parent );

			// create a new node for the interpolator itself
			this.node = insertAfter( node, document.createTextNode( '' ) );
		} else {
			// otherwise reuse the existing node
			this.node = node;
		}

		// insert the interpolator itself
		parent.add( this );

		// if there was text after the interpolator (possibly containing more interpolators), preserve it
		if ( mustache.end < text.length ) {
			this.next = insertAfter( this.node, document.createTextNode( text.substring( mustache.end ) ) );
		} else {
			this.next = this.node.nextSibling;
		}
	};

	models.Interpolator.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Interpolator( this, parentNode, contextStack, anchor );
		}
	};

	models.Triple = function ( mustache, node, parent ) {
		
		var text;

		text = node.textContent;

		this.parent = parent;

		// get keypath and context stack etc
		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.contextStack = parent.contextStack;
		this.binding = parent.binding;
		this.level = parent.level + 1;

		// create an anchor
		this.anchor = insertAfter( node, document.createElement( 'a' ) );
		this.anchor.setAttribute( 'class', 'binding-anchor' );

		
		// if the interpolator isn't the first thing in this text node, preserve what came before
		if ( mustache.start > 0 ) {
			node.textContent = text.substr( 0, mustache.start );
			new models.Text( node, parent );

			
		} else {
			// otherwise remove it, we don't need it any more
			remove( node );
		}

		// insert the interpolator itself
		parent.add( this );

		// if there was text after the interpolator (possibly containing more interpolators), preserve it
		if ( mustache.end < text.length ) {
			this.next = insertAfter( this.anchor, document.createTextNode( text.substring( mustache.end ) ) );
		} else {
			this.next = this.anchor.nextSibling;
		}
	};

	models.Triple.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Triple( this, parentNode, contextStack, anchor );
		}
	};

	models.Element = function ( node, parent) {
		
		var i, numAttributes, attribute, mustache;

		this.parent = parent;
		this.binding = parent.binding;
		this.level = parent.level + 1;
		this.contextStack = parent.contextStack;

		this.type = node.tagName;
		this.attributes = attributeListToArray( node.attributes );

		numAttributes = this.attributes.length;
		for ( i=0; i<numAttributes; i+=1 ) {
			attribute = this.attributes[i];

			// strip comments
			attribute.value = attribute.value.replace( comment, '' );

			mustache = findMustache( attribute.value, 0 );
			
			// if no mustaches, attribute is 'simple'
			if ( !mustache ) {
				attribute.type = 'simple';
				continue; // nothing more to do here
			}

			attribute.type = 'dynamic';
		}
		

		if ( node.childNodes.length ) {
			this.children = new models.List( node.childNodes, parent );
		}

		parent.add( this );

		this.next = node.nextSibling;
	};

	models.Element.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Element( this, parentNode, contextStack, anchor );
		}
	};*/


	return models;
}( _, bindingViews ));