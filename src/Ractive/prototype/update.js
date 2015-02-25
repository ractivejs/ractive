import Hook from './shared/hooks/Hook';
import runloop from 'global/runloop';

var updateHook = new Hook( 'update' );

export default function Ractive$update ( keypathStr ) {
	var promise, keypath;

	keypath = this.viewmodel.getKeypath( keypathStr || '' );

	promise = runloop.start( this, true );
	keypath.mark();
	runloop.end();

	updateHook.fire( this, keypath );

	return promise;
}
