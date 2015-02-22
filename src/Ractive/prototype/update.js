import Hook from './shared/hooks/Hook';
import runloop from 'global/runloop';

var updateHook = new Hook( 'update' );

export default function Ractive$update ( keypath ) {
	var promise;

	keypath = this.viewmodel.getKeypath( keypath ) || this.viewmodel.rootKeypath;

	promise = runloop.start( this, true );
	keypath.mark();
	runloop.end();

	updateHook.fire( this, keypath );

	return promise;
}
