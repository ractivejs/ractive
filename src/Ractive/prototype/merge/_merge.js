define([
	'global/runloop',
	'utils/warn',
	'utils/isArray',
	'shared/clearCache',
	'shared/makeTransitionManager',
	'shared/notifyDependants',
	'Ractive/prototype/shared/replaceData',
	'Ractive/prototype/merge/mapOldToNewIndex',
	'Ractive/prototype/merge/queueDependants'
], function (
	runloop,
	warn,
	isArray,
	clearCache,
	makeTransitionManager,
	notifyDependants,
	replaceData,
	mapOldToNewIndex,
	queueDependants
) {

	'use strict';

	var identifiers = {};

	return function merge ( keypath, array, options ) {

		var currentArray,
			oldArray,
			newArray,
			identifier,
			lengthUnchanged,
			i,
			newIndices,
			mergeQueue,
			updateQueue,
			depsByKeypath,
			deps,
			transitionManager,
			upstreamQueue,
			keys;

		currentArray = this.get( keypath );

		// If either the existing value or the new value isn't an
		// array, just do a regular set
		if ( !isArray( currentArray ) || !isArray( array ) ) {
			return this.set( keypath, array, options && options.complete );
		}

		lengthUnchanged = ( currentArray.length === array.length );

		if ( options && options.compare ) {

			// If `compare` is `true`, we use JSON.stringify to compare
			// objects that are the same shape, but non-identical - i.e.
			// { foo: 'bar' } !== { foo: 'bar' }
			if ( options.compare === true ) {
				identifier = stringify;
			}

			else if ( typeof options.compare === 'string' ) {
				identifier = getIdentifier( options.compare );
			}

			else if ( typeof options.compare == 'function' ) {
				identifier = options.compare;
			}

			else {
				throw new Error( 'The `compare` option must be a function, or a string representing an identifying field (or `true` to use JSON.stringify)' );
			}

			try {
				oldArray = currentArray.map( identifier );
				newArray = array.map( identifier );
			} catch ( err ) {
				// fallback to an identity check - worst case scenario we have
				// to do more DOM manipulation than we thought...

				// ...unless we're in debug mode of course
				if ( this.debug ) {
					throw err;
				} else {
					warn( 'Merge operation: comparison failed. Falling back to identity checking' );
				}

				oldArray = currentArray;
				newArray = array;
			}

		} else {
			oldArray = currentArray;
			newArray = array;
		}


		// find new indices for members of oldArray
		newIndices = mapOldToNewIndex( oldArray, newArray );


		// Update the model
		// TODO allow existing array to be updated in place, rather than replaced?
		replaceData( this, keypath, array );

		if ( newIndices.unchanged && lengthUnchanged ) {
			// noop - but we still needed to replace the data
			return;
		}

		runloop.start( this );


		// Manage transitions
		this._transitionManager = transitionManager = makeTransitionManager( this, options && options.complete );

		// Go through all dependant priority levels, finding merge targets
		mergeQueue = [];
		updateQueue = [];

		for ( i=0; i<this._deps.length; i+=1 ) { // we can't cache this._deps.length as it may change!
			depsByKeypath = this._deps[i];

			if ( !depsByKeypath ) {
				continue;
			}

			deps = depsByKeypath[ keypath ];

			if ( deps ) {
				queueDependants( keypath, deps, mergeQueue, updateQueue );

				while ( mergeQueue.length ) {
					mergeQueue.pop().merge( newIndices );
				}

				while ( updateQueue.length ) {
					updateQueue.pop().update();
				}
			}
		}

		runloop.end();

		// Finally, notify direct dependants of upstream keypaths...
		upstreamQueue = [];

		keys = keypath.split( '.' );
		while ( keys.length ) {
			keys.pop();
			upstreamQueue.push( keys.join( '.' ) );
		}

		notifyDependants.multiple( this, upstreamQueue, true );

		// length property has changed - notify dependants
		// TODO in some cases (e.g. todo list example, when marking all as complete, then
		// adding a new item (which should deactivate the 'all complete' checkbox
		// but doesn't) this needs to happen before other updates. But doing so causes
		// other mental problems. not sure what's going on...
		if ( oldArray.length !== newArray.length ) {
			notifyDependants( this, keypath + '.length', true );
		}



		// transition manager has finished its work
		transitionManager.init();
	};

	function stringify ( item ) {
		return JSON.stringify( item );
	}

	function getIdentifier ( str ) {
		if ( !identifiers[ str ] ) {
			identifiers[ str ] = function ( item ) {
				return item[ str ];
			};
		}

		return identifiers[ str ];
	}

});
