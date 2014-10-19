export default function Viewmodel$updateSpecials ( keypath, newIndices ) {
	var specials, updatedSpecials = [];

	specials = this.specials[ keypath ];

	if ( !specials ) {
		return;
	}

	newIndices.forEach( ( newIndex, oldIndex ) => {
		var dependants;

		// if newIndex is -1, it'll unbind itself. if
		// newIndex === oldIndex, nothing needs to happen
		if ( newIndex === -1 || newIndex === oldIndex ) {
			return;
		}

		dependants = specials[ oldIndex ];

		dependants.forEach( d => d.setValue( newIndex ) );
		updatedSpecials[ newIndex ] = dependants;
	});
}