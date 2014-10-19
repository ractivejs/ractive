export default function Viewmodel$updateSpecials ( keypath, newIndices ) {
	var specials, updatedSpecials = [];

	specials = this.specials[ keypath ];

	if ( !specials ) {
		return;
	}

	newIndices.forEach( ( newIndex, oldIndex ) => {
		var dependants;

		if ( ~newIndex === -1 ) {
			// going to be unbound anyway... disregard
		} else {
			dependants = specials[ oldIndex ];

			dependants.forEach( d => d.setValue( newIndex ) );
			updatedSpecials[ newIndex ] = dependants;
		}
	});
}