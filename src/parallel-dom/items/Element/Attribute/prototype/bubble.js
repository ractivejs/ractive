import runloop from 'global/runloop';

export default function Attribute$bubble () {
	// If an attribute's text fragment contains a single item, we can
	// update the DOM immediately...
	if ( this.selfUpdating ) {
		this.update();
	}

	// otherwise we want to register it as a deferred attribute, to be
	// updated once all the information is in, to prevent unnecessary
	// DOM manipulation
	else if ( !this.deferred && this.ready ) {
		runloop.addAttribute( this );
		this.deferred = true;
	}
}
