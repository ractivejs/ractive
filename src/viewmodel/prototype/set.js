import { isEqual } from 'utils/is';
import createBranch from 'utils/createBranch';

export default function Viewmodel$set ( keypath, value, options = {} ) {
	var mapping, computation, wrapper, dontTeardownWrapper;

	// unless data is being set for data tracking purposes
	if ( !options.noMapping ) {
		// If this data belongs to a different viewmodel,
		// pass the change along
		if ( mapping = this.mappings[ keypath.firstKey ] ) {
			return mapping.set( keypath, value );
		}
	}

	computation = this.computations[ keypath.str ];
	if ( computation ) {
		if ( computation.setting ) {
			// let the other computation set() handle things...
			return;
		}
		computation.set( value );
		value = computation.get();
	}

	if ( isEqual( this.cache[ keypath.str ], value ) ) {
		return;
	}

	wrapper = this.wrapped[ keypath.str ];

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

	if ( !options.silent ) {
		this.mark( keypath );
	} else {
		// We're setting a parent of the original target keypath (i.e.
		// creating a fresh branch) - we need to clear the cache, but
		// not mark it as a change
		this.clearCache( keypath.str );
	}
}

function resolveSet ( viewmodel, keypath, value ) {
	var wrapper, parentValue, wrapperSet, valueSet;

	wrapperSet = function() {
		if ( wrapper.set ) {
			wrapper.set( keypath.lastKey, value );
		} else {
			parentValue = wrapper.get();
			valueSet();
		}
	};

	valueSet = function(){
		if ( !parentValue ) {
			parentValue = createBranch( keypath.lastKey );
			viewmodel.set( keypath.parent, parentValue, { silent: true } );
		}
		parentValue[ keypath.lastKey ] = value;
	};

	wrapper = viewmodel.wrapped[ keypath.parent.str ];

	if ( wrapper ) {
		wrapperSet();
	} else {
		parentValue = viewmodel.get( keypath.parent );

		// may have been wrapped via the above .get()
		// call on viewmodel if this is first access via .set()!
		if( wrapper = viewmodel.wrapped[ keypath.parent.str ] ) {
			wrapperSet();
		} else {
			valueSet();
		}
	}
}
