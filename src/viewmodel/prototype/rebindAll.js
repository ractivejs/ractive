export default function Viewmodel$rebindAll ( oldKeypath, newKeypath ) {
	var viewmodel = this, toRegister = [];

	rebindDeps( oldKeypath );

	toRegister.forEach( item => {
		this.register( item.keypath, item.dep, item.group );
	});

	function rebindDeps ( keypath ) {
		[ 'computed', 'default' ].forEach( group => {
			var deps,
				childKeypaths;

			deps = viewmodel.deps[ group ][ keypath ];

			if ( deps ) {
				deps.slice().forEach( d => {
					viewmodel.unregister( keypath, d, group );

					toRegister.push({
						keypath: keypath.replace( oldKeypath, newKeypath ),
						dep: d,
						group: group
					});
				});
			}

			if ( childKeypaths = viewmodel.depsMap[ group ][ keypath ] ) {
				childKeypaths.forEach( rebindDeps );
			}
		});
	}
}