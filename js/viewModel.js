/*jslint white: true, nomen: true */
/*global _ */

var ViewModel = (function ( _ ) {

	'use strict';

	var ViewModel = function ( o ) {
		var key;

		this.data = {};

		for ( key in o ) {
			if ( o.hasOwnProperty( key ) ) {
				this.data[ key ] = o[ key ];
			}
		}

		this.pendingResolution = [];
		this.subscriptions = {};
	};

	ViewModel.prototype = {
		set: function ( keypath, value ) {
			var k, keys, key, obj, i, numUnresolved, numResolved, unresolved, resolved, index, address;

			// allow multiple values to be set in one go
			if ( typeof keypath === 'object' ) {
				for ( k in keypath ) {
					if ( keypath.hasOwnProperty( k ) ) {
						this.set( k, keypath[k] );
					}
				}
			}

			else {
				// split key path into keys
				keys = keypath.split( '.' );

				obj = this.data;
				while ( keys.length > 1 ) {
					key = keys.shift();
					obj = obj[ key ] || {};
				}

				key = keys[0];

				obj[ key ] = value;
				this.publish( keypath, value );
			}

			// see if we can resolve any of the unresolved addresses (if such there be)
			numUnresolved = this.pendingResolution.length;
			resolved = [];
			for ( i=0; i<numUnresolved; i+=1 ) {
				unresolved = this.pendingResolution[i];
				console.log( 'attempting to resolve ', unresolved.item.keypath, unresolved.item.contextStack );
				address = this.getAddress( unresolved.item.keypath, unresolved.item.contextStack );

				if ( address ) {
					unresolved.item.address = address;
					unresolved.callback.call( unresolved.item, this.get( address ) );

					console.log( 'successfully resolved:', address, this.get( address ) );

					resolved[ resolved.length ] = unresolved;
				}
			}

			// remove any resolved addresses from the register
			numResolved = resolved.length;
			for ( i=0; i<numResolved; i+=1 ) {
				index = this.pendingResolution.indexOf( resolved[i] );
				this.pendingResolution.splice( index, 1 );
			}
		},

		get: function ( address ) {
			var keys, result;

			keys = address.split( '.' );

			result = this.data;
			while ( keys.length ) {
				result = result[ keys.shift() ];

				if ( result === undefined ) {
					return undefined;
				}
			}

			return result;
		},

		getAddress: function ( keypath, contextStack ) {

			// TODO refactor this, it's fugly

			var keys, keysClone, innerMost, result, contextStackClone;

			contextStack = ( contextStack ? contextStack.concat() : [] );
			contextStackClone = contextStack.concat();

			while ( contextStack ) {

				innerMost = ( contextStack.length ? contextStack[ contextStack.length - 1 ] : null );
				keys = ( innerMost ? innerMost.split( '.' ).concat( keypath.split( '.' ) ) : keypath.split( '.' ) );
				keysClone = keys.concat();

				result = this.data;
				while ( keys.length ) {
					result = result[ keys.shift() ];
				
					if ( result === undefined ) {
						break;
					}
				}

				if ( result !== undefined ) {
					return keysClone.join( '.' );
				}

				if ( contextStack.length ) {
					contextStack.pop();
				} else {
					contextStack = false;
				}
			}

			console.warn( 'Failed to resolve address from ', keypath, contextStackClone );
		},

		registerUnresolvedAddress: function ( item, onResolve ) {
			this.pendingResolution[ this.pendingResolution.length ] = {
				item: item,
				callback: onResolve
			};
		},

		publish: function ( keypath, value ) {
			var self = this, subscriptionsGroupedByLevel = this.subscriptions[ keypath ] || [], i, j, level, subscription;

			for ( i=0; i<subscriptionsGroupedByLevel.length; i+=1 ) {
				level = subscriptionsGroupedByLevel[i];

				if ( level ) {
					for ( j=0; j<level.length; j+=1 ) {
						subscription = level[j];

						if ( keypath !== subscription.originalKeypath ) {
							value = self.get( subscription.originalKeypath );
						}
						subscription.callback( value );
					}
				}
			}
		},

		subscribe: function ( keypath, level, callback ) {
			
			var self = this, originalKeypath = keypath, subscriptionRefs = [], subscribe;

			subscribe = function ( keypath ) {
				var subscriptions, subscription;

				subscriptions = self.subscriptions[ keypath ] = self.subscriptions[ keypath ] || [];
				subscriptions = subscriptions[ level ] = subscriptions[ level ] || [];

				subscription = {
					callback: callback,
					originalKeypath: originalKeypath
				};

				subscriptions[ subscriptions.length ] = subscription;
				subscriptionRefs[ subscriptionRefs.length ] = {
					keypath: keypath,
					level: level,
					subscription: subscription
				};
			};

			while ( keypath.lastIndexOf( '.' ) !== -1 ) {
				subscribe( keypath );

				// remove the last item in the keypath, so that viewModel.set( 'parent', { child: 'newValue' } ) affects views dependent on parent.child
				keypath = keypath.substr( 0, keypath.lastIndexOf( '.' ) );
			}

			subscribe( keypath );

			return subscriptionRefs;
		},

		unsubscribe: function ( subscriptionRef ) {
			var levels, subscriptions, index;

			levels = this.subscriptions[ subscriptionRef.keypath ];
			if ( !levels ) {
				// nothing to unsubscribe
				return;
			}

			subscriptions = levels[ subscriptionRef.level ];
			if ( !subscriptions ) {
				// nothing to unsubscribe
				return;
			}

			index = subscriptions.indexOf( subscriptionRef.subscription );

			if ( index === -1 ) {
				// nothing to unsubscribe
				return;
			}

			// remove the subscription from the list...
			subscriptions.splice( index, 1 );

			// ...then tidy up if necessary
			if ( subscriptions.length === 0 ) {
				delete levels[ subscriptionRef.level ];
			}

			if ( levels.length === 0 ) {
				delete this.subscriptions[ subscriptionRef.keypath ];
			}
		},

		unsubscribeAll: function ( subscriptionRefs ) {
			while ( subscriptionRefs.length ) {
				this.unsubscribe( subscriptionRefs.shift() );
			}
		}
	};

	return ViewModel;

}( _ ));