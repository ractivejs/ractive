import runloop from 'global/runloop';
import isEqual from 'utils/isEqual';
import createBranch from 'utils/createBranch';

export default function Viewmodel$set ( keypath, value, silent ) {
	var mapping, computation, wrapper, dontTeardownWrapper;

	// If this data belongs to a different viewmodel,
	// pass the change along
	if ( mapping = this.mappings[ keypath.split( '.' )[0] ] ) {
		var originKeypath = keypath.replace( mapping.localKey, mapping.originKeypath );
		return mapping.origin.set( originKeypath, value );
	}

	runloop.addViewmodel( this ); // TODO remove other instances of this call

	computation = this.computations[ keypath ];
	if ( computation ) {
		if ( computation.setting ) {
			// let the other computation set() handle things...
			return;
		}
		computation.set( value );
		value = computation.get();
	}

	if ( isEqual( this.cache[ keypath ], value ) ) {
		return;
	}

	wrapper = this.wrapped[ keypath ];

	// If we have a wrapper with a `reset()` method, we try and use it. If the
	// `reset()` method returns false, the wrapper should be torn down, and
	// (most likely) a new one should be created later
	if ( wrapper && wrapper.reset ) {
		dontTeardownWrapper = ( wrapper.reset( value ) !== false );

		if ( dontTeardownWrapper ) {
			value = wrapper.get();
		}
	}

	if ( !computation && !dontTeardownWrapper ) {
		resolveSet( this, keypath, value );
	}

	if ( !silent ) {
		this.mark( keypath );
	} else {
		// We're setting a parent of the original target keypath (i.e.
		// creating a fresh branch) - we need to clear the cache, but
		// not mark it as a change
		this.clearCache( keypath );
	}
}

function resolveSet ( viewmodel, keypath, value ) {

	var keys, lastKey, parentKeypath, wrapper, parentValue, wrapperSet, valueSet;

	wrapperSet = function() {
		if ( wrapper.set ) {
			wrapper.set( lastKey, value );
		} else {
			parentValue = wrapper.get();
			valueSet();
		}
	};

	valueSet = function(){
		if ( !parentValue ) {
			parentValue = createBranch( lastKey );
			viewmodel.set( parentKeypath, parentValue, true );
		}
		parentValue[ lastKey ] = value;
	};

	keys = keypath.split( '.' );
	lastKey = keys.pop();
	parentKeypath = keys.join( '.' );

	wrapper = viewmodel.wrapped[ parentKeypath ];

	if ( wrapper ) {
		wrapperSet();
	} else {
		parentValue = viewmodel.get( parentKeypath );

		// may have been wrapped via the above .get()
		// call on viewmodel if this is first access via .set()!
		if( wrapper = viewmodel.wrapped[ parentKeypath ] ) {
			wrapperSet();
		} else {
			valueSet();
		}
	}
}
