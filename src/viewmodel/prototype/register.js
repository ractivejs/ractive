export default function Viewmodel$register ( dependant ) {
	var depsByKeypath, deps, ractive, keypath, priority, evaluator;

	ractive = this.ractive;
	keypath = dependant.keypath;
	priority = dependant.priority;

	depsByKeypath = this.deps[ priority ] || ( this.deps[ priority ] = {} );
	deps = depsByKeypath[ keypath ] || ( depsByKeypath[ keypath ] = [] );

	deps.push( dependant );
	dependant.registered = true;

	if ( !keypath ) {
		return;
	}

	if ( evaluator = ractive._evaluators[ keypath ] ) {
		if ( !evaluator.dependants ) {
			evaluator.wake();
		}

		evaluator.dependants += 1;
	}

	updateDependantsMap( this, keypath );
}

function updateDependantsMap ( viewmodel, keypath ) {
	var keys, parentKeypath, map;

	// update dependants map
	keys = keypath.split( '.' );

	while ( keys.length ) {
		keys.pop();
		parentKeypath = keys.join( '.' );

		map = viewmodel.depsMap[ parentKeypath ] || ( viewmodel.depsMap[ parentKeypath ] = [] );

		if ( map[ keypath ] === undefined ) {
			map[ keypath ] = 0;
			map[ map.length ] = keypath;
		}

		map[ keypath ] += 1;

		keypath = parentKeypath;
	}
}
