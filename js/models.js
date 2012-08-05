/*jslint white: true, nomen: true */
/*global Anglebars, document, _ */

(function ( Anglebars, _ ) {

	'use strict';

	var insertBefore,
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

			match.formula = match[5];
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
				if ( !match[6] ) {
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
		return false;
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
	mustache = /(\{)?\{\{(#|\^|\/)?(\>)?(&)?\s*([\s\S]+?)\s*\}\}(\})?/g;


	SECTION = 'section';
	INTERPOLATOR = 'interpolator';
	TRIPLE = 'triple';
	PARTIAL = 'partial';



	Anglebars.models = {};

	Anglebars.models.getListFromNodes = function ( nodes, parent ) {
		return new Anglebars.models.List( expandNodes( nodes ), parent );
	};

	Anglebars.models.List = function ( expandedNodes, parent ) {
		this.expanded = expandedNodes;
		this.parent = parent;
		this.level = parent.level + 1;
		this.anglebars = parent.anglebars;
		this.contextStack = parent.contextStack;

		this.compile();
	};

	Anglebars.models.List.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new Anglebars.views.List( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent ) {
			return new Anglebars.evaluators.List( this, parent );
		},

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
					this.add( new Anglebars.models.Text( start.text, this ) );
					return i+1;

				case 'element':
					this.add( new Anglebars.models.Element( start.original, this ) );
					return i+1;

				case 'mustache':
					
					switch ( start.mustache.type ) {
						case SECTION:

							i += 1;
							sliceStart = i; // first item in section
							keypath = start.mustache.keypath;
							nesting = 1;

							// find end
							while ( ( i < this.expanded.length ) && !sliceEnd ) {
								
								bit = this.expanded[i];

								if ( bit.type === 'mustache' ) {
									if ( bit.mustache.type === 'section' && bit.mustache.keypath === keypath ) {
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
								throw new Error( 'Illegal section "' + keypath + '"' );
							}

							this.add( new Anglebars.models.Section( start.mustache, this.expanded.slice( sliceStart, sliceEnd ), this ) );
							return i;


						case TRIPLE:

							this.add( new Anglebars.models.Triple( start.mustache, this ) );
							return i+1;


						case INTERPOLATOR:

							this.add( new Anglebars.models.Interpolator( start.mustache, this ) );
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
		}
	};

	Anglebars.models.Section = function ( mustache, expandedNodes, parent ) {

		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.parent = parent;
		this.level = parent.level + 1;
		this.anglebars = parent.anglebars;

		this.inverted = mustache.inverted;

		this.list = new Anglebars.models.List( expandedNodes, this );
	};

	Anglebars.models.Section.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new Anglebars.views.Section( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent ) {
			return new Anglebars.evaluators.Section( this, parent );
		}
	};

	Anglebars.models.Text = function ( text, parent ) {
		this.text = text;

		// TODO these are no longer self-adding, so non whitespace preserving empties need to be handled another way
		if ( /^\s+$/.test( text ) || text === '' ) {
			if ( !parent.anglebars.preserveWhitespace ) {
				return; // don't bother keeping this if it only contains whitespace, unless that's what the user wants
			}
		}
	};

	Anglebars.models.Text.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new Anglebars.views.Text( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent ) {
			return new Anglebars.evaluators.Text( this, parent );
		}
	};

	Anglebars.models.Interpolator = function ( mustache, parent ) {
		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.parent = parent;
		this.anglebars = parent.anglebars;
		this.level = parent.level + 1;
	};

	Anglebars.models.Interpolator.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new Anglebars.views.Interpolator( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent ) {
			return new Anglebars.evaluators.Interpolator( this, parent );
		}
	};

	Anglebars.models.Triple = function ( mustache, parent ) {
		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.anglebars = parent.anglebars;
		this.level = parent.level + 1;
	};

	Anglebars.models.Triple.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new Anglebars.views.Triple( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent ) {
			return new Anglebars.evaluators.Interpolator( this, parent ); // Triples are the same as Interpolators in this context
		}
	};

	Anglebars.models.Element = function ( original, parent ) {
		this.type = original.tagName;
		this.parent = parent;
		this.anglebars = parent.anglebars;
		this.level = parent.level + 1;


		this.getAttributes( original );


		if ( original.childNodes.length ) {
			this.children = new Anglebars.models.List( expandNodes( original.childNodes ), this );
		}
	};

	Anglebars.models.Element.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new Anglebars.views.Element( this, parentNode, contextStack, anchor );
		},

		getAttributes: function ( original ) {
			var i, numAttributes, attribute;

			this.attributes = [];

			numAttributes = original.attributes.length;
			for ( i=0; i<numAttributes; i+=1 ) {
				attribute = original.attributes[i];
				this.attributes[i] = new Anglebars.models.Attribute( attribute.name, attribute.value, this.anglebars );
			}
		}
	};

	Anglebars.models.Attribute = function ( name, value, anglebars ) {
		var components = expandText( value );

		this.name = name;
		if ( !findMustache( value ) ) {
			this.value = value;
			return;
		}

		this.isDynamic = true;
		this.list = new Anglebars.models.List( components, {
			anglebars: anglebars,
			level: 0
		});
	};

	Anglebars.models.Attribute.prototype = {
		render: function ( node, contextStack ) {
			return new Anglebars.views.Attribute( this, node, contextStack );
		}
	};

}( Anglebars, _ ));