import runloop from 'global/runloop';
import syncSelect from 'virtualdom/items/Element/special/select/sync';

export default function bubbleSelect () {
	if ( !this.dirty ) {
		this.dirty = true;

		runloop.afterViewUpdate( () => {
			syncSelect( this );
			this.dirty = false;
		});
	}

	this.parentFragment.bubble(); // default behaviour
}
