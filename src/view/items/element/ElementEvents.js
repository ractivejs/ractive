import { fatal } from '../../../utils/log';

class DOMEvent {
	constructor ( name, owner ) {
		if ( name.indexOf( '*' ) !== -1 ) {
			fatal( `Only component proxy-events may contain "*" wildcards, <${owner.name} on-${name}="..."/> is not valid` );
		}

		this.name = name;
		this.owner = owner;
		this.handler = null;
	}

	listen ( directive ) {
		const node = this.owner.node;
		const name = this.name;

		// this is probably a custom event fired from a decorator or manually
		if ( !( `on${name}` in node ) ) return;

		this.owner.on( name, this.handler = ( event ) => {
			return directive.fire({
				node,
				original: event,
				event,
				name
			});
		});
	}

	unlisten () {
		if ( this.handler ) this.owner.off( this.name, this.handler );
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
			return directive.fire( event );
		});
	}

	unlisten () {
		this.handler.teardown();
	}
}

export { DOMEvent, CustomEvent };
