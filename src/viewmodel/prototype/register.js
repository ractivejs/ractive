import { getKey, getKeypath } from 'shared/keypaths';

export default function Viewmodel$register ( keypath, dependant, group = 'default' ) {
	var mapping, depsByKeypath, deps;

	if ( dependant.isStatic ) {
		return;
	}

	// TODO temporary
	if ( typeof keypath === 'string' ) {
		keypath = getKeypath( keypath );
	}

	if ( mapping = this.mappings[ keypath.firstKey ] ) {
		return mapping.register( keypath.str, dependant, group );
	}

	depsByKeypath = this.deps[ group ] || ( this.deps[ group ] = {} );
	deps = depsByKeypath[ keypath ] || ( depsByKeypath[ keypath ] = [] );

	deps.push( dependant );

	if ( keypath.isRoot ) {
		return;
	}

	updateDependantsMap( this, keypath, group );
}

function updateDependantsMap ( viewmodel, keypath, group ) {
	var map, parent;

	// update dependants map
	while ( !keypath.isRoot ) {
		map = viewmodel.depsMap[ group ] || ( viewmodel.depsMap[ group ] = {} );
		parent = map[ keypath.parent ] || ( map[ keypath.parent ] = [] );

		if ( parent[ keypath ] === undefined ) {
			parent[ keypath ] = 0;
			parent.push( keypath.str );
		}

		parent[ keypath ] += 1;
		keypath = keypath.parent;
	}
}
