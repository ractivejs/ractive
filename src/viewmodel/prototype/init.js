import log from 'utils/log/log';

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

	if ( origin.computations[ keypath ] ) {
		return log.critical({
			debug: viewmodel.ractive.debug,
			message: 'computedCannotMapToComputed',
			args: {
				key: key,
				otherKey: keypath
			}
		});
	}

	// unbind which will unregister dependants
	mapping.unbind();
	delete viewmodel.mappings[ key ];

	// need to move existing dependants that belong to this key
	deps = origin.unregister( keypath );

	// create a new mapping in the other viewmodel
	origin.map( keypath, {
		origin: viewmodel,
		keypath: key,
		deps: deps
	});
}

function init ( computation ) {
	computation.init();
}

