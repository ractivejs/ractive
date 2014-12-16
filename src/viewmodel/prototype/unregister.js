import { removeFromArray } from 'utils/array';
import { getKeypath } from 'shared/keypaths';

export default function Viewmodel$unregister ( keypath, dependant, group = 'default' ) {
	var mapping, deps, index;

	if ( dependant.isStatic ) {
		return;
	}

	// TODO temporary
	keypath = getKeypath( keypath );

	if ( mapping = this.mappings[ keypath.firstKey ] ) {
		return mapping.unregister( keypath.str, dependant, group );
	}

	deps = this.deps[ group ][ keypath ];
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
		parent = map[ keypath.parent ];

		parent[ keypath ] -= 1;

		if ( !parent[ keypath ] ) {
			// remove from parent deps map
			removeFromArray( parent, keypath.str );
			parent[ keypath ] = undefined;
		}

		keypath = keypath.parent;
	}
}
