(function ( A ) {

	var arrayPointer, splitKeypath, keypathNormaliser;

	// ViewModel constructor
	A.ViewModel = function ( data ) {
		// Initialise with supplied data, or create an empty object
		this.data = data || {};

		// Create empty array for keypaths that can't be resolved initially
		this.pendingResolution = [];

		// Create empty object for observers
		this.observers = {};

		// Dependent Anglebars instances
		this.dependents = [];
	};

	A.ViewModel.prototype = {

		// Update the `value` of `keypath`, and notify the observers of
		// `keypath` and its descendants
		set: function ( keypath, value ) {
			var k, keys, key, obj, i, unresolved, resolved, fullKeypath, normalisedKeypath;

			// Allow multiple values to be set in one go
			if ( typeof keypath === 'object' ) {
				for ( k in keypath ) {
					if ( keypath.hasOwnProperty( k ) ) {
						this.set( k, keypath[k] );
					}
				}

				return;
			}

			// fire events
			this.dependents.forEach( function ( dep ) {
				if ( dep.setting ) {
					return; // short-circuit any potential infinite loops
				}

				dep.setting = true;
				dep.fire( 'set', keypath, value );
				dep.fire( 'set:' + keypath, value );
				dep.setting = false;
			});	


			// Split key path into keys (e.g. `'foo.bar[0]'` -> `['foo','bar',0]`)
			keys = splitKeypath( keypath );
			normalisedKeypath = keys.join( '.' );

			// TODO accommodate implicit array generation
			obj = this.data;
			while ( keys.length > 1 ) {
				key = keys.shift();
				obj = obj[ key ] || {};
			}

			key = keys[0];

			obj[ key ] = value;

			// Trigger updates of views that observe `keypaths` or its descendants
			this._notifyObservers( normalisedKeypath, value );

			// See if we can resolve any of the unresolved keypaths (if such there be)
			i = this.pendingResolution.length;
			while ( i-- ) { // Work backwards, so we don't go in circles!
				unresolved = this.pendingResolution.splice( i, 1 )[0];

				resolved = this.resolveRef( unresolved.view.model.ref, unresolved.view.contextStack );

				// If we were able to find a keypath, initialise the view
				if ( resolved ) {
					unresolved.callback( resolved.keypath, resolved.value );
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

			keys = splitKeypath( keypath );

			result = this.data;
			while ( keys.length ) {
				if ( result ) {
					result = result[ keys.shift() ];
				}

				if ( result === undefined ) {
					return result;
				}
			}

			if ( typeof result === 'function' ) {
				return result.call( this, keypath );
			}

			return result;
		},

		// Force notify observers of `keypath` (useful if e.g. an array or object member
		// was changed without calling `anglebars.set()`)
		update: function ( keypath ) {
			if ( keypath ) {
				this._notifyObservers( keypath, this.get( keypath ) );
			}

			// no keypath? update all the things
			else {
				for ( keypath in this.data ) {
					if ( this.data.hasOwnProperty( keypath ) ) {
						this._notifyObservers( keypath, this.get( keypath ) );
					}
				}
			}
		},

		registerView: function ( view ) {
			var self = this, resolved, fullKeypath, initialUpdate, value, index;

			if ( view.parentFragment && ( view.model.ref in view.parentFragment.indexRefs ) ) {
				// this isn't a real keypath, it's an index reference
				index = view.parentFragment.indexRefs[ view.model.ref ];

				value = ( view.model.fmtrs ? view.root._format( index, view.model.fmtrs ) : index );
				view.update( value );

				return; // this value will never change, and doesn't have a keypath
			}

			initialUpdate = function ( keypath, value ) {
				view.keypath = keypath;

				// create observers
				view.observerRefs = self.observe({
					keypath: keypath,
					priority: view.model.p || 0,
					view: view
				});

				// pass value through formatters, if there are any
				if ( view.model.fmtrs ) {
					value = view.root._format( value, view.model.fmtrs );
				}

				view.update( value );
			};

			resolved = this.resolveRef( view.model.ref, view.contextStack );


			if ( !resolved ) {
				this.registerUnresolvedKeypath({
					view: view,
					callback: initialUpdate
				});
			} else {
				initialUpdate( resolved.keypath, resolved.value );
			}
		},

		// Resolve a full keypath from `ref` within the given `contextStack` (e.g.
		// `'bar.baz'` within the context stack `['foo']` might resolve to `'foo.bar.baz'`
		resolveRef: function ( ref, contextStack ) {

			var innerMost, keypath, value;

			// Implicit iterators - i.e. {{.}} - are a special case
			if ( ref === '.' ) {
				keypath = contextStack[ contextStack.length - 1 ];
				value = this.get( keypath );

				return { keypath: keypath, value: value };
			}

			// Clone the context stack, so we don't mutate the original
			contextStack = contextStack.concat();

			// Take each context from the stack, working backwards from the innermost context
			while ( contextStack.length ) {

				innerMost = contextStack.pop();

				keypath = innerMost + '.' + ref;
				value = this.get( keypath );

				if ( value !== undefined ) {
					return { keypath: keypath, value: value };
				}
			}

			value = this.get( ref );
			if ( value !== undefined ) {
				return { keypath: ref, value: value };
			}
		},

		registerUnresolvedKeypath: function ( unresolved ) {
			this.pendingResolution[ this.pendingResolution.length ] = unresolved;
		},

		_notifyObservers: function ( keypath, value ) {
			var self = this, observersGroupedByLevel = this.observers[ keypath ] || [], i, j, priority, observer, actualValue;

			for ( i=0; i<observersGroupedByLevel.length; i+=1 ) {
				priority = observersGroupedByLevel[i];

				if ( priority ) {
					for ( j=0; j<priority.length; j+=1 ) {
						observer = priority[j];

						if ( keypath !== observer.originalAddress ) {
							actualValue = self.get( observer.originalAddress );
						} else {
							actualValue = value;
						}

						// apply formatters, if there are any
						if ( observer.view.model.fmtrs ) {
							actualValue = observer.view.root._format( actualValue, observer.view.model.fmtrs );
						}

						observer.view.update( actualValue );
					}
				}
			}
		},

		observe: function ( options ) {

			var self = this, keypath, originalAddress = options.keypath, priority = options.priority, observerRefs = [], observe;

			// Allow `observe( keypath, callback )` syntax
			if ( arguments.length === 2 && typeof arguments[0] === 'string' && typeof arguments[1] === 'function' ) {
				return this.observe({ keypath: arguments[0], callback: arguments[1], priority: 0 });
			}

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
		A.ViewModel.prototype.cancelKeypathResolution = function ( view ) {
			this.pendingResolution = this.pendingResolution.filter( function ( pending ) {
				return pending.view !== view;
			});
		};
	}

	else { // Internet Exploder
		A.ViewModel.prototype.cancelKeypathResolution = function ( view ) {
			var i, filtered = [];

			for ( i=0; i<this.pendingResolution.length; i+=1 ) {
				if ( this.pendingResolution[i].view !== view ) {
					filtered[ filtered.length ] = this.pendingResolution[i];
				}
			}

			this.pendingResolution = filtered;
		};
	}



	
	keypathNormaliser = /\[\s*([0-9]+)\s*\]/g;
	splitKeypath = function ( keypath ) {
		var normalised;

		// normalise keypath (e.g. 'foo[0]' becomes 'foo.0')
		normalised = keypath.replace( keypathNormaliser, '.$1' );

		return normalised.split( '.' );
	};



}( Anglebars ));
