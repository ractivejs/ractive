import Hook from './shared/hooks/Hook';
import log from 'utils/log/log';
import runloop from 'global/runloop';
import { getKeypath, rootKeypath } from 'shared/keypaths';

var updateHook = new Hook( 'update' );

export default function Ractive$update ( keypath, callback ) {
	var promise;

	if ( typeof keypath === 'function' ) {
		callback = keypath;
		keypath = rootKeypath;
	} else {
		keypath = getKeypath( keypath ) || rootKeypath;
	}

	promise = runloop.start( this, true );

	this.viewmodel.mark( keypath );
	runloop.end();

	updateHook.fire( this, keypath );

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

	return promise;
}
