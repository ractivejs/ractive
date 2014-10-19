export default function Viewmodel$updateSpecials ( keypath, newIndices ) {
	var specials, updatedSpecials = [];

	specials = this.specials[ keypath ];

	if ( !specials ) {
		return;
	}

	newIndices.forEach( ( newIndex, oldIndex ) => {
		var dependants;

		// if newIndex is -1, it'll unbind itself
		if ( newIndex === -1 ) {
			return;
		}

		dependants = specials[ oldIndex ];

		// if newIndex === oldIndex, nothing needs to happen
		if ( newIndex === oldIndex ) {
			updatedSpecials[ newIndex ] = dependants;
			return;
		}

		dependants.forEach( d => d.setValue( newIndex ) );
		updatedSpecials[ newIndex ] = dependants;
	});

	this.specials[ keypath ] = updatedSpecials;
}