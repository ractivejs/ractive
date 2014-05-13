import get from 'shared/get';
import registerDependant from 'shared/registerDependant';
import unregisterDependant from 'shared/unregisterDependant';

export default function Mustache$resolve ( keypath ) {
	var rebindTarget;

	// In some cases, we may resolve to the same keypath (if this is
	// an expression mustache that was rebound due to an ancestor's
	// keypath) - in which case, this is a no-op
	if ( keypath === this.keypath ) {
		return;
	}

	// if we resolved previously, we need to unregister
	if ( this.registered ) {
		unregisterDependant( this );

		// need to rebind the element, if this belongs to one, for keypath changes
		if ( this.parentFragment &&
			this.parentFragment.owner &&
			this.parentFragment.owner.element ) {
			rebindTarget = this.parentFragment.owner.element;
		} else {
			rebindTarget = this;
		}

		rebindTarget.rebind( null, null, this.keypath, keypath );

		// if we already updated due to rebinding, we can exit
		if ( keypath === this.keypath ) {
			return;
		}
	}

	this.keypath = keypath;
	registerDependant( this );

	this.setValue( get( this.root, keypath ) );
}
