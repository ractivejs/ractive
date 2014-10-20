export default function Viewmodel$rebindAll ( keypath, newIndices ) {
	var viewmodel = this, toRebind = [];

	newIndices.forEach( ( newIndex, oldIndex ) => {
		var oldKeypath, newKeypath;

		// if newIndex is -1, it'll unbind itself. if
		// newIndex === oldIndex, nothing needs to happen
		if ( newIndex === -1 || newIndex === oldIndex ) {
			return;
		}

		oldKeypath = keypath + '.' + oldIndex;
		newKeypath = keypath + '.' + newIndex;

		rebind( oldKeypath );

		function rebind ( keypath ) {
			[ 'mappings', 'computed', 'default' ].forEach( group => {
				var deps, childKeypaths;

				if ( deps = viewmodel.deps[ group ][ keypath ] ) {
					deps.forEach( d => {
						toRebind.push({
							oldKeypath: keypath,
							newKeypath: keypath.replace( oldKeypath, newKeypath ),
							dep: d,
							group: group
						});
					});
				}

				if ( childKeypaths = viewmodel.depsMap[ group ][ keypath ] ) {
					childKeypaths.forEach( rebind );
				}
			});
		}
	});

	toRebind.forEach( item => {
		viewmodel.unregister( item.oldKeypath, item.dep, item.group );
		viewmodel.register( item.newKeypath, item.dep, item.group );

		if ( item.dep.keypath === item.oldKeypath ) {
			item.dep.keypath = item.newKeypath;
		} else {
			console.error( 'TODO' ); // TODO what about bindings, is this a problem?
		}
	});
}
