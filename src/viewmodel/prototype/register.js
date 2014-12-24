export default function Viewmodel$register ( keypath, dependant, group = 'default' ) {
	var mapping, depsByKeypath, deps;

	if ( dependant.isStatic ) {
		return; // TODO we should never get here if a dependant is static...
	}

	if ( mapping = this.mappings[ keypath.firstKey ] ) {
		mapping.register( keypath, dependant, group );
	}

	else {
		depsByKeypath = this.deps[ group ] || ( this.deps[ group ] = {} );
		deps = depsByKeypath[ keypath.str ] || ( depsByKeypath[ keypath.str ] = [] );

		deps.push( dependant );

		if ( !keypath.isRoot ) {
			updateDependantsMap( this, keypath, group );
		}
	}
}

function updateDependantsMap ( viewmodel, keypath, group ) {
	var map, parent, keypathStr;

	// update dependants map
	while ( !keypath.isRoot ) {
		map = viewmodel.depsMap[ group ] || ( viewmodel.depsMap[ group ] = {} );
		parent = map[ keypath.parent.str ] || ( map[ keypath.parent.str ] = [] );

		keypathStr = keypath.str;

		// TODO find an alternative to this nasty approach
		if ( parent[ '_' + keypathStr ] === undefined ) {
			parent[ '_' + keypathStr ] = 0;
			parent.push( keypath );
		}

		parent[ '_' + keypathStr ] += 1;
		keypath = keypath.parent;
	}
}
