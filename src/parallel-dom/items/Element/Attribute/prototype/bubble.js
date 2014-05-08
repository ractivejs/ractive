import runloop from 'global/runloop';

export default function Attribute$bubble () {
	var value = this.fragment.getValue();

	if ( value !== this.value ) {
		this.value = value;
		runloop.addUpdate( this );
	}

	// TODO does this ever happen
	else {
		throw new Error( 'attribute set to same value?' );
	}
}
