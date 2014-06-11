import initialise from 'Ractive/initialise';

// The Child constructor contains the default init options for this class

export default function initChildInstance ( child, Child, options ) {

	if ( child.beforeInit ) {
		child.beforeInit( options );
	}

	initialise( child, options );
}
