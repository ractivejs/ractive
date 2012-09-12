var Anglebars = (function () {

	'use strict';

	var Anglebars, utils;
	

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

			// get data
			if ( o.data ) {
				if ( o.data instanceof Anglebars.Data ) {
					this.data = o.data;
				} else {
					this.data = new Anglebars.Data( o.data );
				}
			}

			// get formatters
			this.formatters = o.formatters;

			// get misc options
			this.preserveWhitespace = o.preserveWhitespace;
			this.replaceSrcAttributes = ( o.replaceSrcAttributes === undefined ? true : o.replaceSrcAttributes );

			this.compiled = this.compile();

			// empty container and render
			this.el.innerHTML = '';
			this.render();
		},

		compile: function () {
			var nodes, rootList;

			// remove all comments
			this.template = utils.stripComments( this.template );

			nodes = utils.getNodeArrayFromHtml( this.template, this.replaceSrcAttributes );

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

		// shortcuts
		set: function () {
			this.data.set.apply( this.data, arguments );
		},

		get: function () {
			this.data.get.apply( this.data, arguments );
		},

		format: function ( value, formatters ) {
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

}());

