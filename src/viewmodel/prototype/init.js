import create from 'utils/create';
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
	deps = mapping.deps;

	if ( origin.computations[ keypath ] ) {
		return log.critical({
			debug: viewmodel.ractive.debug,
			message: 'computedCannotMapTo',
			args: {
				key: key,
				other: keypath,
				reason: 'it is a computated property or expression'
			}
		});
	}

	// unbind which will unregister dependants on the other viewmodel
	mapping.unbind();

	// the dependants of the torndown mapping can now be
	// directly registered on _this_ viewmodel because
	// it is the data owner
	deps.forEach( d => viewmodel.register( d.keypath, d.dep, d.group ) );

	// create a new mapping in the other viewmodel
	mapping = origin.map( keypath, {
		origin: viewmodel,
		keypath: key,
		reversed: true
	});

	// store a ref so it can be reverted if needed
	viewmodel.reversedMappings = viewmodel.reversedMappings || create( null );
	viewmodel.reversedMappings[ key ] = mapping;
}

function init ( computation ) {
	computation.init();
}
