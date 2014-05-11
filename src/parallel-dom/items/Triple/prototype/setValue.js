import runloop from 'global/runloop';

var unwrap = { evaluateWrapped: true };

export default function Triple$setValue ( value ) {
	var wrapper;

	// TODO is there a better way to approach this?
	if ( wrapper = this.root._wrapped[ this.keypath ] ) {
		value = wrapper.get();
	}

	if ( value !== this.value ) {
		this.value = value;
		this.parentFragment.bubble();

		if ( this.rendered ) {
			runloop.addUpdate( this );
		}
	}
}
