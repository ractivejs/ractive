export default function Viewmodel$unregister ( dependant ) {
	var deps, index, keypath, priority, evaluator;

	if ( dependant.isStatic ) {
		return;
	}

	keypath = dependant.keypath;
	priority = dependant.priority;

	deps = this.deps[ priority ][ keypath ];
	index = deps.indexOf( dependant );

	if ( index === -1 || !dependant.registered ) {
		throw new Error( 'Attempted to remove a dependant that was no longer registered! This should not happen. If you are seeing this bug in development please raise an issue at https://github.com/RactiveJS/Ractive/issues - thanks' );
	}

	deps.splice( index, 1 );
	dependant.registered = false;

	if ( !keypath ) {
		return;
	}

	if ( evaluator = this.evaluators[ keypath ] ) {
		evaluator.dependants -= 1;

		if ( !evaluator.dependants ) {
			evaluator.sleep();
		}
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

		map = viewmodel.depsMap[ parentKeypath ];

		map[ keypath ] -= 1;

		if ( !map[ keypath ] ) {
			// remove from parent deps map
			map.splice( map.indexOf( keypath ), 1 );
			map[ keypath ] = undefined;
		}

		keypath = parentKeypath;
	}
}
