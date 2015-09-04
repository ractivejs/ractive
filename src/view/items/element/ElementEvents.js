import { missingPlugin } from '../../../config/errors';
import { fatal } from '../../../utils/log';

class DOMEvent {

	constructor ( name, owner ) {

		if ( name.indexOf( '*' ) !== -1 ) {
			fatal( `Only component proxy-events may contain "*" wildcards, <${owner.name} on-${name}="..."/> is not valid` );
		}

		this.name = name;
		this.owner = owner;
		this.node = null;
		this.handler = null;
	}

	listen ( directive ) {
		const node = this.node = this.owner.node,
			  name = this.name;

		if ( !( `on${name}` in node ) ) {
			missingPlugin( name, 'events' );
		}

		node.addEventListener( name, this.handler = function( event ) {
			directive.fire({
				node: node,
				original: event
			});
		}, false );
	}

	unlisten () {
		this.node.removeEventListener( this.name, this.handler, false );
	}
}

class CustomEvent {

	constructor ( eventPlugin, owner ) {
		this.eventPlugin = eventPlugin;
		this.owner = owner;
		this.handler = null;
	}

	listen ( directive ) {
		const node = this.owner.node;

		this.handler = this.eventPlugin( node, function( event = {} ) {
			event.node = event.node || node;
			directive.fire( event );
		});
	}

	unlisten () {
		this.handler.teardown();
	}
}

export { DOMEvent, CustomEvent };
