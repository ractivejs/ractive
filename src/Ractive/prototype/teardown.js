import Hook from 'Ractive/prototype/shared/hooks/Hook';
import log from 'utils/log/log';
import Promise from 'utils/Promise';
import { removeFromArray } from 'utils/array';

var teardownHook = new Hook( 'teardown' );

// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself

export default function Ractive$teardown ( callback ) {
	var promise;

	this.fragment.unbind();
	this.viewmodel.teardown();

	if ( this.fragment.rendered && this.el.__ractive_instances__ ) {
		removeFromArray( this.el.__ractive_instances__, this );
	}

	this.shouldDestroy = true;
	promise = ( this.fragment.rendered ? this.unrender() : Promise.resolve() );

	teardownHook.fire( this );

	if ( callback ) {

		log.warn({
			debug: this.debug,
			message: 'usePromise',
			args: {
				method: 'ractive.teardown'
			}
		});

		promise
			.then( callback.bind( this ) )
			.then( null, err => {
				log.consoleError({
					debug: this.debug,
					err: err
				});
			});
	}

	this._boundFunctions.forEach( deleteFunctionCopy );

	return promise;
}

function deleteFunctionCopy ( bound ) {
	delete bound.fn[ bound.prop ];
}
