/*jslint white: true */

var Anglebars, getEl, wait;



Anglebars = function ( options ) {

	var defaults, key;

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
		async: false,
		maxBatch: 50,
		append: false,
		twoway: true,
		formatters: {}
	};

	for ( key in defaults ) {
		if ( this[ key ] === undefined ) {
			this[ key ] = defaults[ key ];
		}
	}


	// Initialization
	// --------------

	if ( this.el !== undefined ) {
		this.el = getEl( this.el ); // turn ID string into DOM element
	}

	if ( this.viewmodel === undefined ) {
		this.viewmodel = new Anglebars.ViewModel();
	}

	if ( this.data ) {
		this.viewmodel.set( this.data );
	}

	// If we were given uncompiled partials, compile them
	if ( this.partials ) {
		for ( key in this.partials ) {
			if ( this.partials.hasOwnProperty( key ) ) {
				if ( typeof this.partials[ key ] === 'string' ) {
					if ( !Anglebars.compile ) {
						throw new Error( 'Missing Anglebars.compile - cannot compile partial "' + key + '". Either precompile or use the version that includes the compiler' );
					}

					this.partials[ key ] = Anglebars.compile( this.partials, this ); // all compiler options are present on `this`, so just passing `this`
				}
			}
		}
	}

	// Compile template, if it hasn't been compiled already
	if ( typeof this.template === 'string' ) {
		if ( !Anglebars.compile ) {
			throw new Error( 'Missing Anglebars.compile - cannot compile template. Either precompile or use the version that includes the compiler' );
		}

		this.template = Anglebars.compile( this.template, this );
	}

	// If passed an element, render immediately
	if ( this.el ) {
		this.render({ el: this.el, callback: this.callback, append: this.append });
	}


	// Set up event bus
	this._subs = {};
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
				wait( batch );
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
		wait( batch );
	},




	// Render instance to element specified here or at initialization
	render: function ( options ) {
		var el = ( options.el ? getEl( options.el ) : this.el );

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
			model: this.template,
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

	// Proxies for viewmodel `set`, `get`, `update`, `observe` and `unobserve` methods
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





// helper functions
getEl = function ( input ) {
	var output;

	if ( !input ) {
		throw new Error( 'No container element specified' );
	}

	// We already have a DOM node - no work to do
	if ( input.tagName ) {
		return input;
	}

	// Get node from string
	if ( typeof input === 'string' ) {
		output = document.getElementById( input );

		if ( output.tagName ) {
			return output;
		}
	}

	throw new Error( 'Could not find container element' );
};

wait = (function() {
	var vendors = ['ms', 'moz', 'webkit', 'o'], i, tryVendor, wait;

	if ( typeof window === 'undefined' ) {
		return; // we're not in a browser!
	}
	
	if ( window.requestAnimationFrame ) {
		return function ( task ) {
			window.requestAnimationFrame( task );
		};
	}

	tryVendor = function ( i ) {
		if ( window[ vendors[i]+'RequestAnimationFrame' ] ) {
			return function ( task ) {
				window[ vendors[i]+'RequestAnimationFrame' ]( task );
			};
		}
	};

	for ( i=0; i<vendors.length; i+=1 ) {
		tryVendor( i );
	}

	return function( task ) {
		setTimeout( task, 16 );
	};
}());

// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
Anglebars.isArray = function ( obj ) {
	return Object.prototype.toString.call( obj ) === '[object Array]';
};

Anglebars.isObject = function ( obj ) {
	return ( Object.prototype.toString.call( obj ) === '[object Object]' ) && ( typeof obj !== 'function' );
};