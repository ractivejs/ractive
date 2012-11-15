
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