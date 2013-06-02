(function () {

	var defineProperty,
		
		notifyArrayDependants,
		
		reassignDependants,
		sidewaysShift,
		queueReassignments,
		dispatchReassignmentQueue,
		dispatchIndexRefReassignmentQueue,

		wrapArray,
		unwrapArray,
		WrappedArrayProto,
		testObj,
		mutatorMethods;


	// just in case we don't have Object.defineProperty, we can use this - it doesn't
	// allow us to set non-enumerable properties, but if you're doing for ... in loops on 
	// an array then you deserve what's coming anyway
	if ( !Object.defineProperty ) {
		defineProperty = function ( obj, prop, desc ) {
			obj[ prop ] = desc.value;
		};
	} else {
		defineProperty = Object.defineProperty;
	}
	

	// Register a keypath to this array. When any of this array's mutator methods are called,
	// it will `set` that keypath on the given Ractive instance
	registerKeypathToArray = function ( array, keypath, root ) {
		var roots, keypathsByGuid, rootIndex, keypaths;

		// If this array hasn't been wrapped, we need to wrap it
		if ( !array._ractive ) {
			defineProperty( array, '_ractive', {
				value: {
					roots: [ root ], // there may be more than one Ractive instance depending on this
					keypathsByGuid: {}
				},
				configurable: true
			});

			array._ractive.keypathsByGuid[ root.guid ] = [ keypath ];

			wrapArray( array );
		}

		else {
			roots = array._ractive.roots;
			keypathsByGuid = array._ractive.keypathsByGuid;

			// Does this Ractive instance currently depend on this array?
			// If not, associate them
			if ( !keypathsByGuid[ root.guid ] ) {
				roots[ roots.length ] = root;
				keypathsByGuid[ root.guid ] = [];
			}

			keypaths = keypathsByGuid[ root.guid ];

			// If the current keypath isn't among them, add it
			// TODO to be honest, it probably shoudln't be... can we skip this check?
			if ( keypaths.indexOf( keypath ) === -1 ) {
				keypaths[ keypaths.length ] = keypath;
			}
		}
	};


	// Unregister keypath from array
	unregisterKeypathFromArray = function ( array, keypath, root ) {
		var roots, keypathsByGuid, rootIndex, keypaths, keypathIndex;

		if ( !array._ractive ) {
			throw new Error( 'Attempted to remove keypath from non-wrapped array. This error is unexpected - please send a bug report to @rich_harris' );
		}

		roots = array._ractive.roots;
		keypathsByGuid = array._ractive.keypathsByGuid;

		if ( !keypathsByGuid[ root.guid ] ) {
			throw new Error( 'Ractive instance was not listed as a dependent of this array. This error is unexpected - please send a bug report to @rich_harris' );
		}

		keypaths = keypathsByGuid[ root.guid ];
		keypathIndex = keypaths.indexOf( keypath );

		if ( keypathIndex === -1 ) {
			throw new Error( 'Attempted to unlink non-linked keypath from array. This error is unexpected - please send a bug report to @rich_harris' );
		}

		keypaths.splice( keypathIndex, 1 );

		if ( !keypaths.length ) {
			roots.splice( roots.indexOf( root ), 1 );
			keypathsByGuid[ root.guid ] = null;
		}

		if ( !roots.length ) {
			unwrapArray( array ); // It's good to clean up after ourselves
		}
	};


	notifyArrayDependants = function ( array, methodName, args ) {
		var processRoots,
			processRoot,
			processKeypaths,
			processKeypath,
			queueAllDependants,
			queueDependants,
			keypathsByGuid;

		keypathsByGuid = array._ractive.keypathsByGuid;

		processRoots = function ( roots ) {
			var i = roots.length;
			while ( i-- ) {
				processRoot( roots[i] );
			}
		};

		processRoot = function ( root ) {
			root._transitionManager = makeTransitionManager( noop ); // TODO fire event on complete?
			processKeypaths( root, keypathsByGuid[ root.guid ] );
			root._transitionManager = null;
		};

		processKeypaths = function ( root, keypaths ) {
			var i = keypaths.length;
			while ( i-- ) {
				processKeypath( root, keypaths[i] );
			}
		};

		processKeypath = function ( root, keypath ) {
			var depsByPriority, keys, smartUpdateQueue, dumbUpdateQueue, i, item;

			smartUpdateQueue = [];
			dumbUpdateQueue = [];

			// We don't do root.set(), because we don't want to update DOM sections
			// using the normal method - we want to do a smart update whereby elements
			// are removed from the right place. But we do need to clear the cache
			clearCache( root, keypath );


			// First, notify direct dependants of upstream keypaths...
			keys = splitKeypath( keypath );
			while ( keys.length ) {
				keys.pop();
				notifyDependants( root, keys.join( '.' ), true );
			}

			// ...and length property!
			notifyDependants( root, keypath + '.length', true );
			

			// we probably need to reassign a whole bunch of dependants
			// (e.g. 'items.4' becomes 'items.3' if we're shifting)
			//reassignDependants( root, keypath, array, methodName, args );



			// find dependencies. If any are DOM sections, we do a smart update
			// rather than a ractive.set() blunderbuss
			depsByPriority = root._deps[ keypath ];
			if ( depsByPriority ) {
				queueAllDependants( root, keypath, depsByPriority, smartUpdateQueue, dumbUpdateQueue );

				

				// we may have some deferred evaluators to process
				processDeferredUpdates( root );

				
				i = dumbUpdateQueue.length;
				while ( i-- ) {
					dumbUpdateQueue[i].update();
				}
				
				i = smartUpdateQueue.length;
				while ( i-- ) {
					smartUpdateQueue[i].smartUpdate( methodName, args );
				}
			}



			// we may have some deferred attributes to process
			processDeferredUpdates( root );
		};

		queueAllDependants = function ( root, keypath, depsByPriority, smartUpdateQueue, dumbUpdateQueue ) {
			var len, p, deps;

			len = depsByPriority.length;
			for ( p=0; p<len; p+=1 ) {
				deps = depsByPriority[p];

				if ( deps ) {
					queueDependants( root, keypath, deps, smartUpdateQueue, dumbUpdateQueue );
				}
			}
		};

		// TODO can we get rid of this whole queueing nonsense?
		queueDependants = function ( root, keypath, deps, smartUpdateQueue, dumbUpdateQueue ) {
			var k, dependant;

			k = deps.length;
			while ( k-- ) {
				dependant = deps[k];

				// references need to get process before mustaches
				if ( dependant.type === REFERENCE ) {
					dependant.update();
				}

				// is this a DOM section?
				else if ( dependant.keypath === keypath && dependant.type === SECTION /*&& dependant.parentNode*/ ) {
					smartUpdateQueue[ smartUpdateQueue.length ] = dependant;

				} else {
					dumbUpdateQueue = dependant;
				}
			}
		};

		processRoots( array._ractive.roots );
	};





		
	WrappedArrayProto = [];
	mutatorMethods = [ 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift' ];

	mutatorMethods.forEach( function ( methodName ) {
		var method = function () {
			var result = Array.prototype[ methodName ].apply( this, arguments );

			this._ractive.setting = true;
			notifyArrayDependants( this, methodName, arguments );
			this._ractive.setting = false;

			return result;
		};

		defineProperty( WrappedArrayProto, methodName, {
			value: method
		});
	});

	
	// can we use prototype chain injection?
	// http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/#wrappers_prototype_chain_injection
	testObj = {};
	if ( testObj.__proto__ ) {
		// yes, we can
		wrapArray = function ( array ) {
			array.__proto__ = WrappedArrayProto;
		};

		unwrapArray = function ( array ) {
			delete array._ractive;
			array.__proto__ = Array.prototype;
		};
	}

	else {
		// no, we can't
		wrapArray = function ( array ) {
			var i, methodName;

			i = mutatorMethods.length;
			while ( i-- ) {
				methodName = mutatorMethods[i];
				defineProperty( array, methodName, {
					value: WrappedArrayProto[ methodName ]
				});
			}
		};

		unwrapArray = function ( array ) {
			var i;

			i = mutatorMethods.length;
			while ( i-- ) {
				delete array[ mutatorMethods[i] ];
			}

			delete array._ractive;
		};
	}

}());