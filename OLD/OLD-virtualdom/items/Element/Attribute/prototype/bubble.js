import runloop from 'global/runloop';
import { isEqual } from 'utils/is';

export default function Attribute$bubble () {
	var value = this.useProperty || !this.rendered ? this.fragment.getValue() : this.fragment.toString();

	// TODO this can register the attribute multiple times (see render test
	// 'Attribute with nested mustaches')
	if ( !isEqual( value, this.value ) ) {

		// Need to clear old id from ractive.nodes
		if ( this.name === 'id' && this.value ) {
			delete this.root.nodes[ this.value ];
		}

		this.value = value;

		if ( this.name === 'value' && this.node ) {
			// We need to store the value on the DOM like this so we
			// can retrieve it later without it being coerced to a string
			this.node._ractive.value = value;
		}

		if ( this.rendered ) {
			runloop.addView( this );
		}
	}
}
