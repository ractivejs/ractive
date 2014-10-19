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

		[ 'computed', 'default' ].forEach( group => {
			var deps;

			if ( deps = viewmodel.deps[ group ][ oldKeypath ] ) {
				deps.forEach( d => {
					toRebind.push({
						oldKeypath: oldKeypath,
						newKeypath: newKeypath,
						dep: d
					});
				});
			}
		});
	});

	toRebind.forEach( item => {
		item.dep.rebind( null, null, item.oldKeypath, item.newKeypath );
	});
}