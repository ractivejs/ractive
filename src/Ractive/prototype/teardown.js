import Hook from '../../events/Hook';
import Promise from '../../utils/Promise';
import { removeFromArray } from '../../utils/array';
import { cancel } from '../../shared/methodCallers';
import { warnIfDebug } from '../../utils/log';

const teardownHook = new Hook( 'teardown' );

// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself

export default function Ractive$teardown () {
	if ( this.torndown ) {
		warnIfDebug( 'ractive.teardown() was called on a Ractive instance that was already torn down' );
		return Promise.resolve();
	}

	this.torndown = true;
	this.fragment.unbind();
	this.viewmodel.teardown();

	this._observers.forEach( cancel );

	if ( this.fragment.rendered && this.el.__ractive_instances__ ) {
		removeFromArray( this.el.__ractive_instances__, this );
	}

	this.shouldDestroy = true;
	const promise = ( this.fragment.rendered ? this.unrender() : Promise.resolve() );

	teardownHook.fire( this );

	return promise;
}
