import { removeFromArray } from 'utils/array';

export default function Viewmodel$unregister ( keypath, dependant, group = 'default' ) {
	var mapping, deps, index;

	if ( dependant.isStatic ) {
		return;
	}

	if ( mapping = this.mappings[ keypath.firstKey ] ) {
		return mapping.unregister( keypath, dependant, group );
	}

	deps = this.deps[ group ][ keypath.str ];
	index = deps.indexOf( dependant );

	if ( index === -1 ) {
		throw new Error( 'Attempted to remove a dependant that was no longer registered! This should not happen. If you are seeing this bug in development please raise an issue at https://github.com/RactiveJS/Ractive/issues - thanks' );
	}

	deps.splice( index, 1 );

	if ( keypath.isRoot ) {
		return;
	}

	updateDependantsMap( this, keypath, group );
}

function updateDependantsMap ( viewmodel, keypath, group ) {
	var map, parent;

	// update dependants map
	while ( !keypath.isRoot ) {
		map = viewmodel.depsMap[ group ];
		parent = map[ keypath.parent.str ];

		parent[ '_' + keypath.str ] -= 1;

		if ( !parent[ '_' + keypath.str ] ) {
			// remove from parent deps map
			removeFromArray( parent, keypath );
			parent[ '_' + keypath.str ] = undefined;
		}

		keypath = keypath.parent;
	}
}
