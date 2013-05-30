var defaultOptions = {
	preserveWhitespace: false,
	append: false,
	twoway: true,
	modifyArrays: true,
	data: {},
	lazy: false,
	debug: false
};

Ractive = function ( options ) {

	var key, partial, i, template, templateEl;

	// Options
	// -------
	for ( key in defaultOptions ) {
		if ( defaultOptions.hasOwnProperty( key ) && !options.hasOwnProperty( key ) ) {
			options[ key ] = defaultOptions[ key ];
		}
	}


	// Initialization
	// --------------

	// Generate a unique identifier, for places where you'd use a weak map if it
	// existed
	this.guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r, v;

		r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});

	// options
	this.modifyArrays = options.modifyArrays;
	this.twoway = options.twoway;
	this.lazy = options.lazy;
	this.debug = options.debug;

	this.el = getEl( options.el );

	// add data
	this.data = options.data || {};

	// Set up event bus
	this._subs = {};

	// Set up cache
	this._cache = {};

	// Set up dependants
	this._deps = {};
	this._depsMap = {};

	// Node registry
	this.nodes = {};

	// Set up observers
	this._pendingResolution = [];

	// Create an array for deferred attributes
	this._def = [];

	// Cache proxy event handlers - allows efficient reuse
	this._proxies = {};

	// Keep a list of used expressions, so we don't duplicate them
	this._expressions = [];

	// Set up bindings
	this._bound = [];
	if ( options.bindings ) {
		if ( isArray( options.bindings ) ) {
			for ( i=0; i<options.bindings.length; i+=1 ) {
				this.bind( options.bindings[i] );
			}
		} else {
			this.bind( options.bindings );
		}
	}

	// If we were given unparsed partials, parse them
	if ( options.partials ) {
		this.partials = {};

		for ( key in options.partials ) {
			if ( options.partials.hasOwnProperty( key ) ) {
				partial = options.partials[ key ];

				if ( typeof partial === 'string' ) {
					if ( !Ractive.parse ) {
						throw new Error( missingParser );
					}

					partial = Ractive.parse( partial, options );
				}

				// If the partial was an array with a single string member, that means
				// we can use innerHTML - we just need to unpack it
				if ( partial.length === 1 && typeof partial[0] === 'string' ) {
					partial = partial[0];
				}
				this.partials[ key ] = partial;
			}
		}
	}

	// Compile template, if it hasn't been parsed already
	template = options.template;

	if ( typeof template === 'string' ) {
		if ( !Ractive.parse ) {
			throw new Error( missingParser );
		}

		if ( template.charAt( 0 ) === '#' ) {
			// assume this is an ID of a <script type='text/template'> tag
			templateEl = document.getElementById( template.substring( 1 ) );
			if ( templateEl ) {
				this.template = Ractive.parse( templateEl.innerHTML, options );
			}

			else {
				throw new Error( 'Could not find template element (' + template + ')' );
			}
		}

		else {
			template = Ractive.parse( template, options );
		}
	}

	// If the template was an array with a single string member, that means
	// we can use innerHTML - we just need to unpack it
	if ( template && ( template.length === 1 ) && ( typeof template[0] === 'string' ) ) {
		this.template = template[0];
	} else {
		this.template = template;
	}

	// If passed an element, render immediately
	if ( this.el ) {
		this.render({ el: this.el, append: options.append });
	}
};
