import Input from './Input';
import { isBindable } from '../binding/selectBinding';
import runloop from '../../../../global/runloop';

export default class Textarea extends Input {
	constructor( options ) {
		const template = options.template;

		// if there is a bindable value, there should be no body
		if ( template.a && template.a.value && isBindable( { template: template.a.value } ) ) {
			options.noContent = true;
		}

		// otherwise, if there is a single bindable interpolator as content, move it to the value attr
		else if ( template.f && (!template.a || !template.a.value) && isBindable( { template: template.f } ) ) {
			if ( !template.a ) template.a = {};
			template.a.value = template.f;
			options.noContent = true;
		}

		super( options );
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;

			if ( this.rendered && !this.binding && this.fragment ) {
				runloop.scheduleTask( () => {
					this.dirty = false;
					this.node.value = this.fragment.toString();
				});
			}

			this.parentFragment.bubble(); // default behaviour
		}
	}
}
