import { missingPlugin } from '../../../config/errors';
import { fatal, warnOnce } from '../../../utils/log';

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
		const node = this.node = this.owner.node;
		const name = this.name;

		if ( !( `on${name}` in node ) ) {
			warnOnce( missingPlugin( name, 'events' ) );
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
