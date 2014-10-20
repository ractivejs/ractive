export default function Viewmodel$unregister ( keypath, dependant, group = 'default' ) {
	var binding, deps, index;

	if ( dependant.isStatic ) {
		return;
	}

	if ( binding = this.bindings[ keypath ] ) {
		var originKeypath = keypath.replace( binding.mapping.localKeypath, binding.mapping.keypath );
		return binding.origin.unregister( originKeypath, dependant, group );
	}

	deps = this.deps[ group ][ keypath ];
	index = deps.indexOf( dependant );

	if ( index === -1 ) {
		throw new Error( 'Attempted to remove a dependant that was no longer registered! This should not happen. If you are seeing this bug in development please raise an issue at https://github.com/RactiveJS/Ractive/issues - thanks' );
	}

	deps.splice( index, 1 );

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

		map = viewmodel.depsMap[ group ];
		parent = map[ parentKeypath ];

		parent[ keypath ] -= 1;

		if ( !parent[ keypath ] ) {
			// remove from parent deps map
			parent.splice( parent.indexOf( keypath ), 1 );
			parent[ keypath ] = undefined;
		}

		keypath = parentKeypath;
	}
}
