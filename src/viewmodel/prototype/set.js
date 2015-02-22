export default function Viewmodel$set ( keypath, value, options = {} ) {
	var mapping;

	// unless data is being set for data tracking purposes
	if ( options.noMapping ) {
		// If this data belongs to a different viewmodel,
		// pass the change along
		debugger;
	}

	keypath.set( value, options );
}

