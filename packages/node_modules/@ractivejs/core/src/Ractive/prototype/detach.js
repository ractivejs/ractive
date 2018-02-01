import Hook from '../../events/Hook';
import { removeFromArray } from '../../utils/array';

const detachHook = new Hook( 'detach' );

export default function Ractive$detach () {
	if ( this.isDetached ) {
		return this.el;
	}

	if ( this.el ) {
		removeFromArray( this.el.__ractive_instances__, this );
	}

	this.el = this.fragment.detach();
	this.isDetached = true;

	detachHook.fire( this );
	return this.el;
}
