import { message } from '../../../utils/log';

class DOMEvent {
	constructor ( name, owner ) {
		if ( name.indexOf( '*' ) !== -1 ) {
			message( 'NO_EVENT_WILDCARD', owner.name, name );
		}

		this.name = name;
		this.owner = owner;
		this.node = null;
		this.handler = null;
	}

	listen ( directive ) {
		const node = this.node = this.owner.node;
		const name = this.name;

		if ( !( `on${name}` in node ) ) {
			message( 'MISSING_PLUGIN', name, 'events', { error: false, once: true } );
		}

		node.addEventListener( name, this.handler = function( event ) {
			directive.fire({
				node,
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

		this.handler = this.eventPlugin( node, ( event = {} ) => {
			event.node = event.node || node;
			directive.fire( event );
		});
	}

	unlisten () {
		this.handler.teardown();
	}
}

export { DOMEvent, CustomEvent };
