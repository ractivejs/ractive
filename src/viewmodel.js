
// ViewModel constructor
Anglebars.ViewModel = function ( data ) {
	// Initialise with supplied data, or create an empty object
	this.data = data || {};

	// Create empty array for keypaths that can't be resolved initially
	this.pendingResolution = [];

	// Create empty object for observers
	this.observers = {};
};

Anglebars.ViewModel.prototype = {

	// Update the `value` of `keypath`, and notify the observers of
	// `keypath` and its descendants
	set: function ( keypath, value ) {
		var k, keys, key, obj, i, unresolved, fullKeypath;

		// Allow multiple values to be set in one go
		if ( typeof keypath === 'object' ) {
			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					this.set( k, keypath[k] );
				}
			}

			return;
		}


		// Split key path into keys (e.g. `'foo.bar[0]'` -> `['foo','bar',0]`)
		keys = Anglebars.utils.splitKeypath( keypath );

		// TODO accommodate implicit array generation
		obj = this.data;
		while ( keys.length > 1 ) {
			key = keys.shift();
			obj = obj[ key ] || {};
		}

		key = keys[0];

		obj[ key ] = value;

		// Trigger updates of views that observe `keypaths` or its descendants
		this._notifyObservers( keypath, value );

		// See if we can resolve any of the unresolved keypaths (if such there be)
		i = this.pendingResolution.length;
		while ( i-- ) { // Work backwards, so we don't go in circles!
			unresolved = this.pendingResolution.splice( i, 1 )[0];

			fullKeypath = this.getFullKeypath( unresolved.view.model.partialKeypath, unresolved.view.contextStack );

			// If we were able to find a keypath, initialise the view
			if ( fullKeypath !== undefined ) {
				unresolved.callback( fullKeypath );
			}

			// Otherwise add to the back of the queue (this is why we're working backwards)
			else {
				this.registerUnresolvedKeypath( unresolved );
			}
		}
	},

	// Get the current value of `keypath`
	get: function ( keypath ) {
		var keys, result;

		if ( !keypath ) {
			return undefined;
		}

		keys = Anglebars.utils.splitKeypath( keypath );

		result = this.data;
		while ( keys.length ) {
			if ( result ) {
				result = result[ keys.shift() ];
			}

			if ( result === undefined ) {
				return result;
			}
		}

		return result;
	},

	// Force notify observers of `keypath` (useful if e.g. an array or object member
	// was changed without calling `anglebars.set()`)
	update: function ( keypath ) {
		var value = this.get( keypath );
		this._notifyObservers( keypath, value );
	},

	registerView: function ( view ) {
		var self = this, fullKeypath, initialUpdate, value, formatted;

		initialUpdate = function ( keypath ) {
			view.keypath = keypath;

			// create observers
			view.observerRefs = self.observe({
				keypath: keypath,
				priority: view.model.priority,
				view: view
			});

			value = self.get( keypath );
			formatted = view.anglebars._format( value, view.model.formatters );

			view.update( formatted );
		};

		fullKeypath = this.getFullKeypath( view.model.partialKeypath, view.contextStack );

		if ( fullKeypath === undefined ) {
			this.registerUnresolvedKeypath({
				view: view,
				callback: initialUpdate
			});
		} else {
			initialUpdate( fullKeypath );
		}
	},

	// Resolve a full keypath from `partialKeypath` within the given `contextStack` (e.g.
	// `'bar.baz'` within the context stack `['foo']` might resolve to `'foo.bar.baz'`
	getFullKeypath: function ( partialKeypath, contextStack ) {

		var innerMost;

		// Implicit iterators - i.e. {{.}} - are a special case
		if ( partialKeypath === '.' ) {
			return contextStack[ contextStack.length - 1 ];
		}

		// Clone the context stack, so we don't mutate the original
		contextStack = contextStack.concat();

		// Take each context from the stack, working backwards from the innermost context
		while ( contextStack.length ) {

			innerMost = contextStack.pop();

			if ( this.get( innerMost + '.' + partialKeypath ) !== undefined ) {
				return innerMost + '.' + partialKeypath;
			}
		}

		if ( this.get( partialKeypath ) !== undefined ) {
			return partialKeypath;
		}
	},

	registerUnresolvedKeypath: function ( unresolved ) {
		this.pendingResolution[ this.pendingResolution.length ] = unresolved;
	},

	_notifyObservers: function ( keypath, value ) {
		var self = this, observersGroupedByLevel = this.observers[ keypath ] || [], i, j, priority, observer, formatted;

		for ( i=0; i<observersGroupedByLevel.length; i+=1 ) {
			priority = observersGroupedByLevel[i];

			if ( priority ) {
				for ( j=0; j<priority.length; j+=1 ) {
					observer = priority[j];

					if ( keypath !== observer.originalAddress ) {
						value = self.get( observer.originalAddress );
					}

					if ( observer.view ) {
						formatted = observer.view.anglebars._format( value, observer.view.model.formatters );
						observer.view.update( formatted );
					}

					if ( observer.callback ) {
						observer.callback( value );
					}
				}
			}
		}
	},

	observe: function ( options ) {

		var self = this, keypath, originalAddress = options.keypath, priority = options.priority, observerRefs = [], observe;

		if ( !options.keypath ) {
			return undefined;
		}

		observe = function ( keypath ) {
			var observers, observer;

			observers = self.observers[ keypath ] = self.observers[ keypath ] || [];
			observers = observers[ priority ] = observers[ priority ] || [];

			observer = {
				originalAddress: originalAddress
			};

			// if we're given a view to update, add it to the observer - ditto callbacks
			if ( options.view ) {
				observer.view = options.view;
			}

			if ( options.callback ) {
				observer.callback = options.callback;
			}

			observers[ observers.length ] = observer;
			observerRefs[ observerRefs.length ] = {
				keypath: keypath,
				priority: priority,
				observer: observer
			};
		};

		keypath = options.keypath;
		while ( keypath.lastIndexOf( '.' ) !== -1 ) {
			observe( keypath );

			// remove the last item in the keypath, so that data.set( 'parent', { child: 'newValue' } ) affects views dependent on parent.child
			keypath = keypath.substr( 0, keypath.lastIndexOf( '.' ) );
		}

		observe( keypath );

		return observerRefs;
	},

	unobserve: function ( observerRef ) {
		var priorities, observers, index;

		priorities = this.observers[ observerRef.keypath ];
		if ( !priorities ) {
			// nothing to unobserve
			return;
		}

		observers = priorities[ observerRef.priority ];
		if ( !observers ) {
			// nothing to unobserve
			return;
		}

		if ( observers.indexOf ) {
			index = observers.indexOf( observerRef.observer );
		} else {
			// fuck you IE
			for ( var i=0, len=observers.length; i<len; i+=1 ) {
				if ( observers[i] === observerRef.observer ) {
					index = i;
					break;
				}
			}
		}


		if ( index === -1 ) {
			// nothing to unobserve
			return;
		}

		// remove the observer from the list...
		observers.splice( index, 1 );

		// ...then tidy up if necessary
		if ( observers.length === 0 ) {
			delete priorities[ observerRef.priority ];
		}

		if ( priorities.length === 0 ) {
			delete this.observers[ observerRef.keypath ];
		}
	},

	unobserveAll: function ( observerRefs ) {
		while ( observerRefs.length ) {
			this.unobserve( observerRefs.shift() );
		}
	}
};


if ( Array.prototype.filter ) { // Browsers that aren't unredeemable pieces of shit
	Anglebars.ViewModel.prototype.cancelKeypathResolution = function ( view ) {
		this.pendingResolution = this.pendingResolution.filter( function ( pending ) {
			return pending.view !== view;
		});
	};
}

else { // Internet Exploder
	Anglebars.ViewModel.prototype.cancelKeypathResolution = function ( view ) {
		var i, filtered = [];

		for ( i=0; i<this.pendingResolution.length; i+=1 ) {
			if ( this.pendingResolution[i].view !== view ) {
				filtered[ filtered.length ] = this.pendingResolution[i];
			}
		}

		this.pendingResolution = filtered;
	};
}