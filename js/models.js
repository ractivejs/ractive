/*jslint white: true, nomen: true */
/*global Anglebars, document, _ */

(function ( Anglebars, _ ) {

	'use strict';

	var models = Anglebars.models,
		views = Anglebars.views,
		evaluators = Anglebars.evaluators,
		utils = Anglebars.utils;




	models.List = function ( expandedNodes, parent ) {
		this.expanded = expandedNodes;
		this.parent = parent;
		this.level = parent.level + 1;
		this.anglebars = parent.anglebars;
		this.contextStack = parent.contextStack;

		this.compile();
	};

	models.List.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.List( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent, contextStack ) {
			return new evaluators.List( this, parent, contextStack );
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

			// we don't need the expanded nodes any more
			delete this.expanded;
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
						case 'section':

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

							this.add( new models.Section( start.mustache, this.expanded.slice( sliceStart, sliceEnd ), this ) );
							return i;


						case 'triple':

							this.add( new models.Triple( start.mustache, this ) );
							return i+1;


						case 'interpolator':

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
		}
	};

	models.Section = function ( mustache, expandedNodes, parent ) {

		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.parent = parent;
		this.level = parent.level + 1;
		this.anglebars = parent.anglebars;

		this.inverted = mustache.inverted;

		this.list = new models.List( expandedNodes, this );
	};

	models.Section.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Section( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent, contextStack ) {
			return new evaluators.Section( this, parent, contextStack );
		}
	};

	models.Text = function ( text, parent ) {
		this.text = text;

		// TODO these are no longer self-adding, so non whitespace preserving empties need to be handled another way
		if ( /^\s+$/.test( text ) || text === '' ) {
			if ( !parent.anglebars.preserveWhitespace ) {
				return; // don't bother keeping this if it only contains whitespace, unless that's what the user wants
			}
		}
	};

	models.Text.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Text( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent, contextStack ) {
			return new evaluators.Text( this, parent, contextStack );
		}
	};

	models.Interpolator = function ( mustache, parent ) {
		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.parent = parent;
		this.anglebars = parent.anglebars;
		this.level = parent.level + 1;
	};

	models.Interpolator.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Interpolator( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent, contextStack ) {
			return new evaluators.Interpolator( this, parent, contextStack );
		}
	};

	models.Triple = function ( mustache, parent ) {
		this.keypath = mustache.keypath;
		this.formatters = mustache.formatters;
		this.anglebars = parent.anglebars;
		this.level = parent.level + 1;
	};

	models.Triple.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Triple( this, parentNode, contextStack, anchor );
		},

		getEvaluator: function ( parent, contextStack ) {
			return new evaluators.Interpolator( this, parent, contextStack ); // Triples are the same as Interpolators in this context
		}
	};

	models.Element = function ( original, parent ) {
		this.type = original.tagName;
		this.parent = parent;
		this.anglebars = parent.anglebars;
		this.level = parent.level + 1;


		this.getAttributes( original );


		if ( original.childNodes.length ) {
			this.children = new models.List( utils.expandNodes( original.childNodes ), this );
		}
	};

	models.Element.prototype = {
		render: function ( parentNode, contextStack, anchor ) {
			return new views.Element( this, parentNode, contextStack, anchor );
		},

		getAttributes: function ( original ) {
			var i, numAttributes, attribute;

			this.attributes = [];

			numAttributes = original.attributes.length;
			for ( i=0; i<numAttributes; i+=1 ) {
				attribute = original.attributes[i];
				this.attributes[i] = new models.Attribute( attribute.name, attribute.value, this.anglebars );
			}
		}
	};

	models.Attribute = function ( name, value, anglebars ) {
		var components = utils.expandText( value );

		this.name = name;
		if ( !utils.findMustache( value ) ) {
			this.value = value;
			return;
		}

		this.isDynamic = true;
		this.list = new models.List( components, {
			anglebars: anglebars,
			level: 0
		});
	};

	models.Attribute.prototype = {
		render: function ( node, contextStack ) {
			return new views.Attribute( this, node, contextStack );
		}
	};

}( Anglebars, _ ));