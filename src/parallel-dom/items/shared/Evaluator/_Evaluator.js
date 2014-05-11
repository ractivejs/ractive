import runloop from 'global/runloop';
import warn from 'utils/warn';
import isEqual from 'utils/isEqual';
import get from 'shared/get/_get';
import clearCache from 'shared/clearCache';
import notifyDependants from 'shared/notifyDependants';
import adaptIfNecessary from 'shared/adaptIfNecessary';
import Reference from 'parallel-dom/items/shared/Evaluator/Reference';
import SoftReference from 'parallel-dom/items/shared/Evaluator/SoftReference';

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
		else if ( !this.dirty ) {
			runloop.modelUpdate( this );
			this.dirty = true;
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
			this.dirty = true;
		}

		var i = this.refs.length;
		while ( i-- ) {
			this.refs[i].setValue( get( this.root, this.refs[i].keypath ) );
		}

		if ( this.dirty ) {
			this.update();
			this.dirty = false;
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
	}
};

export default Evaluator;

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
