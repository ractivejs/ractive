import runloop from 'global/runloop';
import Promise from 'utils/Promise';
import notifyDependants from 'shared/notifyDependants';

export default function Ractive$update ( keypath, callback ) {
	var promise, fulfilPromise;

	if ( typeof keypath === 'function' ) {
		callback = keypath;
		keypath = '';
	} else {
		keypath = keypath || '';
	}

	promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });
	runloop.start( this, fulfilPromise );

	this.viewmodel.clearCache( keypath );
	notifyDependants( this, keypath );

	runloop.end();

	this.fire( 'update', keypath );

	if ( callback ) {
		promise.then( callback.bind( this ) );
	}

	return promise;
}
