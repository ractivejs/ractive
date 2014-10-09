export default function Viewmodel$register ( keypath, dependant, group = 'default' ) {
	var depsByKeypath, deps;

	if ( dependant.isStatic ) {
		return;
	}

	depsByKeypath = this.deps[ group ] || ( this.deps[ group ] = {} );
	deps = depsByKeypath[ keypath ] || ( depsByKeypath[ keypath ] = [] );

	deps.push( dependant );

	if ( !keypath ) {
		return;
	}

	updateDependantsMap( this, keypath, group );
}

function updateDependantsMap ( viewmodel, keypath, group ) {
	var keys, parentKeypath, map, parent;

	// update dependants map
	keys = keypath.split( '.' );

	while ( keys.length ) {
		keys.pop();
		parentKeypath = keys.join( '.' );

		map = viewmodel.depsMap[ group ] || ( viewmodel.depsMap[ group ] = {} );
		parent = map[ parentKeypath ] || ( map[ parentKeypath ] = [] );

		if ( parent[ keypath ] === undefined ) {
			parent[ keypath ] = 0;
			parent.push( keypath );
		}

		parent[ keypath ] += 1;

		keypath = parentKeypath;
	}
}
