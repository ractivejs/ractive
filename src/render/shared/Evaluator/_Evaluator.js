define([
	'global/runloop',
	'utils/warn',
	'utils/isEqual',
	'shared/clearCache',
	'shared/notifyDependants',
	'shared/adaptIfNecessary',
	'render/shared/Evaluator/Reference',
	'render/shared/Evaluator/SoftReference'
], function (
	runloop,
	warn,
	isEqual,
	clearCache,
	notifyDependants,
	adaptIfNecessary,
	Reference,
	SoftReference
) {

	'use strict';

	var Evaluator, cache = {};

	Evaluator = function ( root, keypath, uniqueString, functionStr, args, priority ) {
		var evaluator = this;

		evaluator.root = root;
		evaluator.uniqueString = uniqueString;
		evaluator.keypath = keypath;
		evaluator.priority = priority;

		evaluator.fn = getFunctionFromString( functionStr, args.length );
		evaluator.values = [];
		evaluator.refs = [];

		args.forEach( function ( arg, i ) {
			if ( !arg ) {
				return;
			}

			if ( arg.indexRef ) {
				// this is an index ref... we don't need to register a dependant
				evaluator.values[i] = arg.value;
			}

			else {
				evaluator.refs.push( new Reference( root, arg.keypath, evaluator, i, priority ) );
			}
		});

		evaluator.selfUpdating = ( evaluator.refs.length <= 1 );
	};

	Evaluator.prototype = {
		bubble: function () {
			// If we only have one reference, we can update immediately...
			if ( this.selfUpdating ) {
				this.update();
			}

			// ...otherwise we want to register it as a deferred item, to be
			// updated once all the information is in, to prevent unnecessary
			// cascading. Only if we're already resolved, obviously
			else if ( !this.deferred ) {
				runloop.addEvaluator( this );
				this.deferred = true;
			}
		},

		update: function () {
			var value;

			// prevent infinite loops
			if ( this.evaluating ) {
				return this;
			}

			this.evaluating = true;

			try {
				value = this.fn.apply( null, this.values );
			} catch ( err ) {
				if ( this.root.debug ) {
					warn( 'Error evaluating "' + this.uniqueString + '": ' + err.message || err );
				}

				value = undefined;
			}

			if ( !isEqual( value, this.value ) ) {
				this.value = value;

				clearCache( this.root, this.keypath );

				adaptIfNecessary( this.root, this.keypath, value, true );
				notifyDependants( this.root, this.keypath );
			}

			this.evaluating = false;

			return this;
		},

		// TODO should evaluators ever get torn down? At present, they don't...
		teardown: function () {
			while ( this.refs.length ) {
				this.refs.pop().teardown();
			}

			clearCache( this.root, this.keypath );
			this.root._evaluators[ this.keypath ] = null;
		},

		// This method forces the evaluator to sync with the current model
		// in the case of a smart update
		refresh: function () {
			if ( !this.selfUpdating ) {
				this.deferred = true;
			}

			var i = this.refs.length;
			while ( i-- ) {
				this.refs[i].update();
			}

			if ( this.deferred ) {
				this.update();
				this.deferred = false;
			}
		},

		updateSoftDependencies: function ( softDeps ) {
			var i, keypath, ref;

			if ( !this.softRefs ) {
				this.softRefs = [];
			}

			// teardown any references that are no longer relevant
			i = this.softRefs.length;
			while ( i-- ) {
				ref = this.softRefs[i];
				if ( !softDeps[ ref.keypath ] ) {
					this.softRefs.splice( i, 1 );
					this.softRefs[ ref.keypath ] = false;
					ref.teardown();
				}
			}

			// add references for any new soft dependencies
			i = softDeps.length;
			while ( i-- ) {
				keypath = softDeps[i];
				if ( !this.softRefs[ keypath ] ) {
					ref = new SoftReference( this.root, keypath, this );
					this.softRefs.push( ref );
					this.softRefs[ keypath ] = true;
				}
			}

			this.selfUpdating = ( this.refs.length + this.softRefs.length <= 1 );
		}
	};

	return Evaluator;


	function getFunctionFromString ( str, i ) {
		var fn, args;

		str = str.replace( /\$\{([0-9]+)\}/g, '_$1' );

		if ( cache[ str ] ) {
			return cache[ str ];
		}

		args = [];
		while ( i-- ) {
			args[i] = '_' + i;
		}

		fn = new Function( args.join( ',' ), 'return(' + str + ')' );

		cache[ str ] = fn;
		return fn;
	}

});
