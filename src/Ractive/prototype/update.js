import Hook from './shared/hooks/Hook';
import runloop from 'global/runloop';
import { getKeypath, rootKeypath } from 'shared/keypaths';

var updateHook = new Hook( 'update' );

export default function Ractive$update ( keypath ) {
	var promise;

	keypath = getKeypath( keypath ) || rootKeypath;

	promise = runloop.start( this, true );
	this.viewmodel.mark( keypath );
	runloop.end();

	updateHook.fire( this, keypath );

	return promise;
}
