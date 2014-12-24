import Hook from './shared/hooks/Hook';
import Promise from 'utils/Promise';
import { removeFromArray } from 'utils/array';

var teardownHook = new Hook( 'teardown' );

// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself

export default function Ractive$teardown () {
	var promise;

	this.fragment.unbind();
	this.viewmodel.teardown();

	if ( this.fragment.rendered && this.el.__ractive_instances__ ) {
		removeFromArray( this.el.__ractive_instances__, this );
	}

	this.shouldDestroy = true;
	promise = ( this.fragment.rendered ? this.unrender() : Promise.resolve() );

	teardownHook.fire( this );

	this._boundFunctions.forEach( deleteFunctionCopy );

	return promise;
}

function deleteFunctionCopy ( bound ) {
	delete bound.fn[ bound.prop ];
}
