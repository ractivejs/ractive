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
		const node = this.node = this.owner.node;
		const name = this.name;

		// this is probably a custom event fired from a decorator or manually
		if ( !( `on${name}` in node ) ) return;

		node.addEventListener( name, this.handler = function( event ) {
			directive.fire({
				node,
				original: event,
				event,
				name
			});
		}, false );
	}

	unlisten () {
		if ( this.handler ) this.node.removeEventListener( this.name, this.handler, false );
	}
}

class CustomEvent {
	constructor ( eventPlugin, owner, name ) {
		this.eventPlugin = eventPlugin;
		this.owner = owner;
		this.name = name;
		this.handler = null;
	}

	listen ( directive ) {
		const node = this.owner.node;

		this.handler = this.eventPlugin( node, ( event = {} ) => {
			if ( event.original ) event.event = event.original;
			else event.original = event.event;

			event.name = this.name;
			event.node = event.node || node;
			directive.fire( event );
		});
	}

	unlisten () {
		this.handler.teardown();
	}
}

export { DOMEvent, CustomEvent };
