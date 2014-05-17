import runloop from 'global/runloop';
import syncSelect from 'virtualdom/items/Element/special/select/sync';

export default function bubbleSelect () {
	if ( !this.dirty ) {
		this.dirty = true;
		runloop.afterViewUpdate( () => {
			this.dirty = false;
			syncSelect( this );
		});
	}

	this.parentFragment.bubble(); // default behaviour
}
