import runloop from 'global/runloop';

export default function Triple$setValue ( value ) {
	if ( value !== this.value ) {
		this.value = value;
		runloop.addUpdate( this );
	}
}
