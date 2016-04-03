import runloop from '../../global/runloop';
import Transition from '../../view/items/element/Transition';
import { fatal } from '../../utils/log';
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

	if ( !node ) {
		fatal( `No node was supplied for transition ${name}` );
	}

	const transition = new Transition( this, node, name, params );
	const promise = runloop.start( this, true );
	runloop.registerTransition( transition );
	runloop.end();
	return promise;
}
