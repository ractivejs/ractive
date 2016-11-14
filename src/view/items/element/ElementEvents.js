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
				original: event
			});
		}, false );
	}

	unlisten () {
		if ( this.handler ) this.node.removeEventListener( this.name, this.handler, false );
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
