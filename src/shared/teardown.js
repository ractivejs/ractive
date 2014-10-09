import runloop from 'global/runloop';

export default function ( thing ) {
	if ( !thing.keypath ) {
		// this was on the 'unresolved' list, we need to remove it
		runloop.removeUnresolved( thing );
	} else {
		// this was registered as a dependant
		thing.root.viewmodel.unregister( thing.keypath, thing );
	}
}
