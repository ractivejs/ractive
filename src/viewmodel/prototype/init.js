export default function Viewmodel$init () {
	var key, computation, computations = [];

	for ( key in this.ractive.computed ) {
		computation = this.compute( key, this.ractive.computed[ key ] );
		computations.push( computation );
		reverseMapping( this, key );
	}

	computations.forEach( init );
}

function reverseMapping ( viewmodel, key ) {
	var mapping, origin, keypath, deps;

	mapping = viewmodel.mappings[ key ];

	if ( !mapping ) { return; }

	origin = mapping.origin;
	keypath = mapping.keypath;

	if ( origin.deps.computed[ keypath ] ) {
		// err
	}

	// what if there are mappings?

	// observers?

	// need starts with, or does .depsMap help?
	if ( deps = origin.deps.default[ keypath ] ) {
		deps = deps.slice();
		deps.forEach( d => origin.unregister( keypath, d ) );
	}

	mapping.teardown();
	delete viewmodel.mappings[ key ];

	mapping = origin.map( keypath, {
		origin: viewmodel,
		keypath: key
	});

	if ( deps ) {
		deps.forEach( d => {
			mapping.register( d.keypath, d, 'default' );
		});
		viewmodel.mark( key );
	}


}

function init ( computation ) {
	computation.init();
}

