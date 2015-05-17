import Hook from './shared/hooks/Hook';
import runloop from 'global/runloop';

var updateHook = new Hook( 'update' );

export default function Ractive$update ( keypath ) {
	var promise, model;

	model = this.viewmodel.getContext( keypath || '' );

	promise = runloop.start( this, true );
	model.mark();
	runloop.end();

	updateHook.fire( this, model );

	return promise;
}
