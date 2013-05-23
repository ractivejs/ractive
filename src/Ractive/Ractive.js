Ractive = function ( options ) {

	var defaults, key, partial, i;

	// Options
	// -------

	if ( options ) {
		for ( key in options ) {
			if ( options.hasOwnProperty( key ) ) {
				this[ key ] = options[ key ];
			}
		}
	}

	defaults = {
		preserveWhitespace: false,
		append: false,
		twoway: true,
		modifyArrays: true,
		data: {}
	};

	for ( key in defaults ) {
		if ( defaults.hasOwnProperty( key ) && this[ key ] === undefined ) {
			this[ key ] = defaults[ key ];
		}
	}


	// Initialization
	// --------------

	if ( this.el !== undefined ) {
		this.el = getEl( this.el ); // turn ID string into DOM element
	}

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
	this._observers = {};
	this._pendingResolution = [];

	// Create an array for deferred attributes
	this._defAttrs = [];

	// Cache proxy event handlers - allows efficient reuse
	this._proxies = {};

	// Set up bindings
	this._bound = [];
	if ( this.bindings ) {
		if ( isArray( this.bindings ) ) {
			for ( i=0; i<this.bindings.length; i+=1 ) {
				this.bind( this.bindings[i] );
			}
		} else {
			this.bind( this.bindings );
		}
	}

	// If we were given unparsed partials, parse them
	if ( this.partials ) {
		for ( key in this.partials ) {
			if ( this.partials.hasOwnProperty( key ) ) {
				partial = this.partials[ key ];

				if ( typeof partial === 'string' ) {
					if ( !Ractive.parse ) {
						throw new Error( 'Missing Ractive.parse - cannot parse partial "' + key + '". Either preparse or use the version that includes the parser' );
					}

					partial = Ractive.parse( partial, this ); // all parser options are present on `this`, so just passing `this`
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
	if ( typeof this.template === 'string' ) {
		if ( !Ractive.parse ) {
			throw new Error( 'Missing Ractive.parse - cannot parse template. Either preparse or use the version that includes the parser' );
		}

		this.template = Ractive.parse( this.template, this );
	}

	// If the template was an array with a single string member, that means
	// we can use innerHTML - we just need to unpack it
	if ( this.template && ( this.template.length === 1 ) && ( typeof this.template[0] === 'string' ) ) {
		this.template = this.template[0];
	}

	// If passed an element, render immediately
	if ( this.el ) {
		this.render({ el: this.el, append: this.append });
	}
};
