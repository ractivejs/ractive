import runloop from 'global/runloop';

export default function Attribute$bubble () {
	var value = this.fragment.getValue();

	if ( value !== this.value ) {
		this.value = value;

		if ( this.rendered ) {
			runloop.addUpdate( this );
		}
	}
}
