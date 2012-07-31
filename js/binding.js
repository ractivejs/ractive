/*jslint white: true, nomen: true */
/*global _, document, ViewModel, bindingModels */

var Binding = (function ( _, ViewModel, models ) {

	'use strict';

	var Binding,

		formulaSplitter,

		comment,
		lineComment,
		mustache,

		SECTION,
		INTERPOLATOR,
		TRIPLE,
		PARTIAL,

		insertBefore,
		insertAfter,
		remove,
		trim,
		getNodeArrayFromHtml,
		attributeListToArray,

		findMustache,
		findMatch,
		doNothing,
		error,
		warn;

	


	/* =================== */
	//  Utility functions  //
	/* =================== */

	// console shortcuts
	doNothing = function () {};
	error = ( console ? console.error : doNothing );

	// replacement for the dumbass DOM equivalent
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

	trim = function ( text ) {
		var trimmed = text.replace( /^\s+/, '' ).replace( /\s+$/, '' );
		return trimmed;
	};

	getNodeArrayFromHtml = function ( innerHTML ) {

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




	/* ========================= */
	//  Regular expressions etc  //
	/* ========================= */

	



	Binding = function ( o ) {
		this.initialize( o );
	};

	Binding.prototype = {
		initialize: function ( o ) {
			
			var templateEl;

			o = o || {};

			// get container
			this.el = this._getEl( o.el );

			// get template
			templateEl = this._getEl( o.template );
			if ( templateEl ) {
				this.template = templateEl.innerHTML;
			} else {
				this.template = o.template;
			}

			// get viewModel
			if ( o.viewModel ) {
				if ( o.viewModel instanceof ViewModel ) {
					this.viewModel = o.viewModel;
				} else {
					this.viewModel = new ViewModel( o.viewModel );
				}
			}

			// get formatters
			this.formatters = o.formatters;

			// get misc options
			this.preserveWhitespace = o.preserveWhitespace;

			this.compiled = this.compile();

			this.render();
		},

		compile: function () {
			var nodes, rootList;

			// remove all comments
			// TODO handle multiline comments
			this._stripComments();

			nodes = getNodeArrayFromHtml( this.template );

			rootList = new models.getListFromNodes( nodes, {
				contextStack: [],
				binding: this,
				level: 0
			});

			return rootList;
		},

		render: function () {
			this.view = this.compiled.render( this.el );
		},

		_format: function ( value, formatters ) {
			var i, numFormatters, formatterName;

			numFormatters = formatters.length;
			for ( i=0; i<numFormatters; i+=1 ) {
				formatterName = formatters[i];

				if ( this.formatters[ formatterName ] ) {
					value = this.formatters[ formatterName ]( value );
				}
			}

			return value;
		},

		_stripComments: function () {
			// TODO handle multiline comments
			this.template = this.template.replace( comment, '' );
		},

		_getEl: function ( input ) {
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
		}
	};
	

	return Binding;

}( _, ViewModel, bindingModels ));