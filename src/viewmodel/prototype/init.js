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

	// computation to computation is a no-go
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

	// unbind which will unregister dependants on the other viewmodel
	mapping.unbind();

	// remove the mapping key on this viewmodel so next
	// line doesn't send them back to this old mapping!
	delete viewmodel.mappings[ key ];

	// these dependants can now be directly registered
	// on _this_ viewmodel because it is the data owner
	mapping.deps.forEach( d => viewmodel.register( d.keypath, d.dep, d.group ) );

	// TODO: this can be part of mapping.setViewmodel:
	// need to move any existing dependants that were registered on the
	// other viewmodel that now belong to this key. this call removes them
	deps = origin.unregister( keypath );

	// create a new mapping in the other viewmodel
	origin.map( keypath, {
		origin: viewmodel,
		keypath: key,
		// and this will register them under the new mapping
		deps: deps
	});
}

function init ( computation ) {
	computation.init();
}

