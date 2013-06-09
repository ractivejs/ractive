var defaultOptions = {
	preserveWhitespace: false,
	append: false,
	twoway: true,
	modifyArrays: true,
	data: {},
	lazy: false,
	debug: false,
	transitions: {} // TODO transitions on subclasses
};

Ractive = function ( options ) {

	var key, partial, i, template, templateEl, parsedTemplate;

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

	// Set up dependants and index refs
	this._deps = {};
	this._depsMap = {};
	this._indexRefs = {};

	// Node registry
	this.nodes = {};

	// Set up observers
	this._pendingResolution = [];

	// Create arrays for deferred attributes and evaluators
	this._defAttrs = [];
	this._defEvals = [];

	// Cache proxy event handlers - allows efficient reuse
	this._proxies = {};

	// Keep a list of used evaluators, so we don't duplicate them
	this._evaluators = {};

	// Partials registry
	this.partials = {};

	// Transition registry
	this.transitions = options.transitions;

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


	// Parse template, if necessary
	template = options.template;

	if ( typeof template === 'string' ) {
		if ( !Ractive.parse ) {
			throw new Error( missingParser );
		}

		if ( template.charAt( 0 ) === '#' ) {
			// assume this is an ID of a <script type='text/ractive'> tag
			templateEl = doc.getElementById( template.substring( 1 ) );
			if ( templateEl ) {
				parsedTemplate = Ractive.parse( templateEl.innerHTML, options );
			}

			else {
				throw new Error( 'Could not find template element (' + template + ')' );
			}
		}

		else {
			parsedTemplate = Ractive.parse( template, options );
		}
	} else {
		parsedTemplate = template;
	}

	// deal with compound template
	if ( isObject( parsedTemplate ) ) {
		this.partials = parsedTemplate.partials;
		parsedTemplate = parsedTemplate.template;
	}

	// If the template was an array with a single string member, that means
	// we can use innerHTML - we just need to unpack it
	if ( parsedTemplate && ( parsedTemplate.length === 1 ) && ( typeof parsedTemplate[0] === 'string' ) ) {
		parsedTemplate = parsedTemplate[0];
	}

	this.template = parsedTemplate;


	// If we were given unparsed partials, parse them
	if ( options.partials ) {
		for ( key in options.partials ) {
			if ( options.partials.hasOwnProperty( key ) ) {
				partial = options.partials[ key ];

				if ( typeof partial === 'string' ) {
					if ( !Ractive.parse ) {
						throw new Error( missingParser );
					}

					partial = Ractive.parse( partial, options );
				}

				this.partials[ key ] = partial;
			}
		}
	}

	// Unpack string-based partials, if necessary
	for ( key in this.partials ) {
		if ( this.partials.hasOwnProperty( key ) && this.partials[ key ].length === 1 && typeof this.partials[ key ][0] === 'string' ) {
			this.partials[ key ] = this.partials[ key ][0];
		}
	}


	// If passed an element, render immediately
	if ( this.el ) {
		this.render({ el: this.el, append: options.append, complete: options.complete });
	}
};
