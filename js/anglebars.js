/*jslint white: true, nomen: true */
/*global _, document */

var Anglebars = (function ( _ ) {

	'use strict';

	var Anglebars,

		formulaSplitter,

		SECTION,
		INTERPOLATOR,
		TRIPLE,
		PARTIAL,

		utils;
	

	Anglebars = function ( o ) {
		this.initialize( o );
	};

	Anglebars.models = {};
	Anglebars.views = {};
	Anglebars.evaluators = {};
	Anglebars.utils = {};

	utils = Anglebars.utils;

	Anglebars.prototype = {
		initialize: function ( o ) {
			
			var templateEl;

			o = o || {};

			// get container
			this.el = utils.getEl( o.el );

			// get template
			templateEl = utils.getEl( o.template );
			if ( templateEl ) {
				this.template = templateEl.innerHTML;
			} else {
				this.template = o.template;
			}

			// get viewModel
			if ( o.data ) {
				if ( o.data instanceof Anglebars.ViewModel ) {
					this.data = o.data;
				} else {
					this.data = new Anglebars.ViewModel( o.data );
				}
			}

			// get formatters
			this.formatters = o.formatters;

			// get misc options
			this.preserveWhitespace = o.preserveWhitespace;

			this.compiled = this.compile();

			// empty container and render
			this.el.innerHTML = '';
			this.render();
		},

		compile: function () {
			var nodes, rootList;

			// remove all comments
			// TODO handle multiline comments
			this.template = utils.stripComments( this.template );

			nodes = utils.getNodeArrayFromHtml( this.template );

			rootList = new Anglebars.models.List( utils.expandNodes( nodes ), {
				anglebars: this,
				level: 0
			});

			return rootList;
		},

		render: function () {
			if ( this.rendered ) {
				this.rendered.unrender();
			}
			this.rendered = this.compiled.render( this.el );
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
		}
	};

	return Anglebars;

}( _ ));