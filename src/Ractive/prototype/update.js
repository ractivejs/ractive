import Hook from 'Ractive/prototype/shared/hooks/Hook';
import runloop from 'global/runloop';

var updateHook = new Hook( 'update' );

export default function Ractive$update ( keypath, callback ) {
	var promise;

	if ( typeof keypath === 'function' ) {
		callback = keypath;
		keypath = '';
	} else {
		keypath = keypath || '';
	}

	promise = runloop.start( this, true );

	this.viewmodel.mark( keypath );
	runloop.end();

	updateHook.fire( this, keypath );

	if ( callback ) {
		promise.then( callback.bind( this ) );
	}

	return promise;
}
