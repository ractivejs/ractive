
// Create our global variable, which serves as both constructor function and namespace
var Anglebars = function ( options ) {

	// Options
	// -------

	options = options || {};

	// `el` **string | HTMLElement** *optional*  
	// The target element to render to. If omitted, nothing will be rendered
	// until `.render()` is called.
	if ( 'el' in options ) {
		this.el = Anglebars.utils.getEl( options.el );
	}

	// `compiled` **object** *optional*  
	// A precompiled template, generated with the static `Anglebars.compile`
	// method.
	if ( 'compiled' in options ) {
		this.compiled = options.compiled;
	}

	// `template` **string** *optional*  
	// A string containing valid HTML (albeit with mustaches), to be used in
	// the absence of a precompiled template (e.g. during initial development)
	if ( 'template' in options ) {
		this.template = options.template;
	}

	// `partials` **object** *optional*  
	// A hash containing strings representing partial templates
	if ( 'partials' in options ) {
		this.partials = options.partials;
	}

	// `compiledPartials` **object** *optional*  
	// A hash containing compiled partials
	this.compiledPartials = ( 'compiledPartials' in options ? options.compiledPartials : {} );

	// `data` **object | Anglebars.ViewModel** *optional*  
	// An object or an `Anglebars.ViewModel` instance containing the data with
	// which to populate the template. Passing in an existing `Anglebars.ViewModel`
	// instance allows separate Anglebars instances to share a single view model
	this.viewmodel = ( options.data instanceof Anglebars.ViewModel ? options.data : new Anglebars.ViewModel( options.data ) );

	// `formatters` **object** *optional*  
	// An object containing mustache formatter functions
	this.formatters = ( 'formatters' in options ? options.formatters : {} );

	// `preserveWhitespace` **boolean** *optional*  
	// Whether or not to preserve whitespace in the template (e.g. newlines
	// between elements), which is usually ignored by the browser. Defaults
	// to `false`
	this.preserveWhitespace = ( 'preserveWhitespace' in options ? options.preserveWhitespace : false );

	// `replaceSrcAttributes` **boolean** *optional*  
	// Whether to replace src attributes with data-anglebars-src during template
	// compilation (prevents browser requesting non-existent resources).
	// Defaults to `true`
	this.replaceSrcAttributes = ( 'replaceSrcAttributes' in options ? options.replaceSrcAttributes : true );

	// `namespace` **string** *optional*  
	// What namespace to treat as the parent namespace when compiling. This will
	// be guessed from the container element, but can be overridden here
	this.namespace = ( options.namespace ? options.namespace : ( this.el && this.el.namespaceURI !== 'http://www.w3.org/1999/xhtml' ? this.el.namespaceURI : null ) );

	// `async` **boolean** *optional*  
	// Whether to render asynchronously. If `true`, Anglebars will render as much
	// as possible within the time allowed by `maxBatch` (below), before yielding
	// the UI thread until the next available animation frame. Rendering will take
	// longer, but this will prevent the browser from freezing up while it happens.
	// If a `callback` is specified, it will be called when rendering is complete.
	this.async = ( 'async' in options ? options.async : false );

	// `maxBatch` **number** *optional*  
	// Maximum time, in milliseconds, to continue rendering each batch of nodes
	// before yielding the UI thread. Defaults to 50. Longer values will result in
	// a quicker render, but may result in slight 'choppiness'.
	this.maxBatch = ( 'maxBatch' in options ? options.maxBatch : 50 );

	// `append` **boolean** *optional*  
	// Whether to append to `this.el`, rather than overwriting its contents. Defaults
	// to `false`
	this.append = ( 'append' in options ? options.append : false );


	// Initialization
	// --------------

	// If we were given uncompiled partials, compile them
	if ( this.partials ) {
		for ( var key in this.partials ) {
			if ( this.partials.hasOwnProperty( key ) ) {
				this.compiledPartials[ key ] = Anglebars.compile( this.partials[ key ], {
					preserveWhitespace: this.preserveWhitespace,
					replaceSrcAttributes: this.replaceSrcAttributes
				});
			}
		}
	}

	// If we were given a template, compile it
	if ( !this.compiled && this.template ) {
		this.compiled = Anglebars.compile( this.template, {
			preserveWhitespace: this.preserveWhitespace,
			replaceSrcAttributes: this.replaceSrcAttributes,
			namespace: this.namespace,
			partials: this.compiledPartials
		});
	}

	// Render
	if ( this.compiled && this.el ) {
		this.render({ el: this.el, callback: options.callback, append: this.append });
	}
};



// Prototype methods
// =================
Anglebars.prototype = {

	// Add an item to the async render queue
	queue: function ( items ) {
		this._queue = items.concat( this._queue || [] );

		// If the queue is not currently being dispatched, dispatch it
		if ( !this._dispatchingQueue ) {
			this.dispatchQueue();
		}
	},

	// iterate through queue, render as many items as possible before we need to
	// yield the UI thread
	dispatchQueue: function () {
		var self = this, batch, max;

		max = this.maxBatch; // defaults to 50 milliseconds before yielding

		batch = function () {
			var startTime = +new Date(), next;

			// We can't cache self._queue.length because creating new views is likely to
			// modify it
			while ( self._queue.length && ( new Date() - startTime < max ) ) {
				next = self._queue.shift();

				next.parentFragment.items[ next.index ] = Anglebars.DomViews.create( next );
			}

			// If we ran out of time before completing the queue, kick off a fresh batch
			// at the next opportunity
			if ( self._queue.length ) {
				Anglebars.utils.wait( batch );
			}

			// Otherwise, mark queue as dispatched and execute any callback we have
			else {
				self._dispatchingQueue = false;

				if ( self.callback ) {
					self.callback();
					delete self.callback;
				}

				// Oh, and disable async for further updates (TODO - this is messy)
				self.async = false;
			}
		};

		// Do the first batch
		this._dispatchingQueue = true;
		Anglebars.utils.wait( batch );
	},




	// Render instance to element specified here or at initialization
	render: function ( options ) {
		var el = ( options.el ? Anglebars.utils.getEl( options.el ) : this.el );

		if ( !el ) {
			throw new Error( 'You must specify a DOM element to render to' );
		}

		// Clear the element, unless `append` is `true`
		if ( !options.append ) {
			el.innerHTML = '';
		}

		if ( options.callback ) {
			this.callback = options.callback;
		}

		// Render our *root fragment*
		this.rendered = new Anglebars.DomViews.Fragment({
			model: this.compiled,
			anglebars: this,
			parentNode: el
		});

		// If we were given a callback, but we're not in async mode, execute immediately
		if ( !this.async && options.callback ) {
			options.callback();
		}
	},

	// Teardown. This goes through the root fragment and all its children, removing observers
	// and generally cleaning up after itself
	teardown: function () {
		this.rendered.teardown();
	},

	// Proxies for viewmodel `set`, `get` and `update` methods
	set: function () {
		var oldDisplay = this.el.style.display;

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
		var i, numFormatters, formatter, name, args, fn;

		// If there are no formatters, groovy - just return the value unchanged
		if ( !formatters ) {
			return value;
		}

		// Otherwise go through each in turn, applying sequentially
		numFormatters = formatters.length;
		for ( i=0; i<numFormatters; i+=1 ) {
			formatter = formatters[i];
			name = formatter.name;
			args = formatter.args || [];

			// If a formatter was passed in, use it, otherwise see if there's a default
			// one with this name
			fn = this.formatters[ name ] || Anglebars.formatters[ name ];

			if ( fn ) {
				value = fn.apply( this, [ value ].concat( args ) );
			}
		}

		return value;
	}
};


// Static method to compile a template string
Anglebars.compile = function ( template, options ) {
	var nodes, stubs, compiled = [], delimiters, tripleDelimiters, utils = Anglebars.utils;

	options = options || {};

	// If delimiters are specified use them, otherwise reset to defaults
	Anglebars.delimiters = options.delimiters || [ '{{', '}}' ];
	Anglebars.tripleDelimiters = options.tripleDelimiters || [ '{{{', '}}}' ];

	// Compile the regex that will be used to parse the template
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
	standalonePreStrip: /[ \t]+$/,

	arrayPointer: /\[([0-9]+)\]/
};


// Mustache types
Anglebars.types = {
	TEXT:         0,
	INTERPOLATOR: 1,
	TRIPLE:       2,
	SECTION:      3,
	ELEMENT:      4,
	PARTIAL:      5,
	COMMENT:      6,
	DELIMCHANGE:  7,
	MUSTACHE:     8
};


// Default formatters
Anglebars.formatters = {
	equals: function ( a, b ) {
		return a === b;
	},

	greaterThan: function ( a, b ) {
		return a > b;
	},

	greaterThanEquals: function ( a, b ) {
		return a >= b;
	},

	lessThan: function ( a, b ) {
		return a < b;
	},

	lessThanEquals: function ( a, b ) {
		return a <= b;
	}
};