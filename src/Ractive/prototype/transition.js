import runloop from '../../global/runloop';
import Transition from '../../view/items/element/Transition';
import { message } from '../../utils/log';
import { isObject } from '../../utils/is';

export default function Ractive$transition ( name, node, params ) {

	if ( node instanceof HTMLElement ) {
		// good to go
	}
	else if ( isObject( node ) ) {
		// omitted, use event node
		params = node;
	}

	// if we allow query selector, then it won't work
	// simple params like "fast"

	// else if ( typeof node === 'string' ) {
	// 	// query selector
	// 	node = this.find( node )
	// }

	node = node || this.event.node;

	if ( !node || !node._ractive ) {
		message( 'NO_TRANSITION_NODE', name );
	}

	params = params || {};
	const owner = node._ractive.proxy;
	const transition = new Transition({ owner, parentFragment: owner.parentFragment, name, params });
	transition.bind();

	const promise = runloop.start( this, true );
	runloop.registerTransition( transition );
	runloop.end();

	promise.then( () => transition.unbind() );
	return promise;
}
