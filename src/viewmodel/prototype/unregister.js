import removeFromArray from 'utils/removeFromArray';

export default function Viewmodel$unregister ( keypath, dependant, group = 'default' ) {
	var mapping, deps, index;

	if ( !dependant ) {
		return bulkUnregister( this, keypath );
	}

	if ( dependant.isStatic ) {
		return;
	}

	if ( mapping = this.mappings[ keypath.split( '.' )[0] ] ) {
		return mapping.unregister( keypath, dependant, group );
	}

	deps = this.deps[ group ][ keypath ];
	index = deps.indexOf( dependant );

	if ( index === -1 ) {
		throw new Error( 'Attempted to remove a dependant that was no longer registered! This should not happen. If you are seeing this bug in development please raise an issue at https://github.com/RactiveJS/Ractive/issues - thanks' );
	}

	deps.splice( index, 1 );

	// added clean-up for mappings, how does it impact other use-cases?
	if ( !deps.length ) {
		delete this.deps[ group ][ keypath ];
	}

	if ( !keypath ) {
		return;
	}

	updateDependantsMap( this, keypath, group );
}

function bulkUnregister ( viewmodel, keypath ) {
	var result, match;

	match = removeMatching( viewmodel, keypath, 'default' );
	if ( match.length ) {
		result = match;
	}

	match = removeMatching( viewmodel, keypath, 'observers' );
	if ( match.legnth ) {
		result = result ? result.concat(match) : match;
	}

	return result;
}

function removeMatching( viewmodel, keypath, group ) {
	var depsGroup = viewmodel.deps[ group ], match = [], key, deps;

	for ( key in depsGroup ) {
		if ( key.indexOf( keypath ) != 0 ) { continue; }

		deps = depsGroup[ key ];
		deps.forEach( d => {
			updateDependantsMap( viewmodel, key, group);
			match.push( { keypath: key, dep: d, group: group });
		});

		delete depsGroup[ key ];
	}

	return match;
}

function updateDependantsMap ( viewmodel, keypath, group ) {
	var keys, parentKeypath, map, parent;

	// update dependants map
	keys = keypath.split( '.' );

	while ( keys.length ) {
		keys.pop();
		parentKeypath = keys.join( '.' );

		map = viewmodel.depsMap[ group ];
		parent = map[ parentKeypath ];

		parent[ keypath ] -= 1;

		if ( !parent[ keypath ] ) {
			// remove from parent deps map
			removeFromArray( parent, keypath );
			parent[ keypath ] = undefined;
		}

		keypath = parentKeypath;
	}
}
