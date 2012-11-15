// ViewModel constructor
Anglebars.ViewModel = function ( data ) {
	// Store data.
	this.data = data || {};

	// Create empty array for keypathes that can't be resolved initially
	this.pendingResolution = [];

	// Create empty object for observers
	this.observers = {};
};

Anglebars.ViewModel.prototype = {
	
	// Update the data model and notify observers
	set: function ( keypath, value ) {
		var k, keys, key, obj, i, unresolved, previous;

		// Allow multiple values to be set in one go
		if ( typeof keypath === 'object' ) {
			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					this.set( k, keypath[k] );
				}
			}

			return;
		}

		
		// Store previous value
		previous = this.get( keypath );

		// split key path into keys
		keys = Anglebars.utils.splitKeypath( keypath );

		obj = this.data;
		while ( keys.length > 1 ) {
			key = keys.shift();
			obj = obj[ key ] || {};
		}

		key = keys[0];

		obj[ key ] = value;

		if ( !Anglebars.utils.isEqual( previous, value ) ) {
			this.publish( keypath, value );
		}

		// see if we can resolve any of the unresolved keypaths (if such there be)
		i = this.pendingResolution.length;

		while ( i-- ) { // work backwards, so we don't go in circles
			unresolved = this.pendingResolution.splice( i, 1 )[0];
			this.getKeypath( unresolved.item, unresolved.item.model.partialKeypath, unresolved.item.contextStack, unresolved.callback );
		}
	},

	get: function ( keypath ) {
		var keys, result;

		if ( !keypath ) {
			return '';
		}

		keys = keypath.split( '.' );

		result = this.data;
		while ( keys.length ) {
			if ( result ) {
				result = result[ keys.shift() ];
			}
			
			if ( result === undefined ) {
				return '';
			}
		}

		return result;
	},

	update: function ( keypath ) {
		var value = this.get( keypath );
		this.publish( keypath, value );
	},

	getKeypath: function ( item, partialKeypath, contextStack, callback ) {

		// TODO refactor this, it's fugly

		var keys, keysClone, innerMost, result, contextStackClone, keypath;

		contextStack = ( contextStack ? contextStack.concat() : [] );
		contextStackClone = contextStack.concat();

		// implicit iterators - i.e. {{.}} - are a special case
		if ( partialKeypath === '.' ) {
			item.keypath = ( contextStack[ contextStack.length - 1 ] );
			callback.call( item, item.keypath );
		}

		while ( contextStack ) {

			innerMost = ( contextStack.length ? contextStack[ contextStack.length - 1 ] : null );
			keys = ( innerMost ? innerMost.split( '.' ).concat( partialKeypath.split( '.' ) ) : partialKeypath.split( '.' ) );
			keysClone = keys.concat();

			result = this.data;
			while ( keys.length ) {
				try {
					result = result[ keys.shift() ];
				} catch ( err ) {
					result = undefined;
					break;
				}
			
				if ( result === undefined ) {
					break;
				}
			}

			if ( result !== undefined ) {
				keypath = keysClone.join( '.' );
				item.keypath = keypath;
				callback.call( item, keypath );
				break;
			}

			if ( contextStack.length ) {
				contextStack.pop();
			} else {
				contextStack = false;
			}
		}

		// if we didn't figure out the keypath, add this to the unresolved list
		if ( result === undefined ) {
			this.registerUnresolvedAddress( item, callback );
		}
	},

	registerUnresolvedAddress: function ( item, onResolve ) {
		this.pendingResolution[ this.pendingResolution.length ] = {
			item: item,
			callback: onResolve
		};
	},

	cancelAddressResolution: function ( item ) {
		if ( this.pendingResolution.filter ) { // non-shit browsers
			this.pendingResolution = this.pendingResolution.filter( function ( pending ) {
				return pending.item !== item;
			});
		}

		else { // IE (you utter, utter piece of shit)
			var i, filtered = [];

			for ( i=0; i<this.pendingResolution.length; i+=1 ) {
				if ( this.pendingResolution[i].item !== item ) {
					filtered[ filtered.length ] = this.pendingResolution[i];
				}
			}

			this.pendingResolution = filtered;
		}
	},

	publish: function ( keypath, value ) {
		var self = this, observersGroupedByLevel = this.observers[ keypath ] || [], i, j, priority, observer;

		for ( i=0; i<observersGroupedByLevel.length; i+=1 ) {
			priority = observersGroupedByLevel[i];

			if ( priority ) {
				for ( j=0; j<priority.length; j+=1 ) {
					observer = priority[j];

					if ( keypath !== observer.originalAddress ) {
						value = self.get( observer.originalAddress );
					}
					observer.callback( value );
				}
			}
		}
	},

	observe: function ( keypath, priority, callback ) {
		
		var self = this, originalAddress = keypath, observerRefs = [], observe;

		if ( !keypath ) {
			return undefined;
		}

		observe = function ( keypath ) {
			var observers, observer;

			observers = self.observers[ keypath ] = self.observers[ keypath ] || [];
			observers = observers[ priority ] = observers[ priority ] || [];

			observer = {
				callback: callback,
				originalAddress: originalAddress
			};

			observers[ observers.length ] = observer;
			observerRefs[ observerRefs.length ] = {
				keypath: keypath,
				priority: priority,
				observer: observer
			};
		};

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

		index = observers.indexOf( observerRef.observer );

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


