import { missingPlugin } from '../../../config/errors';
import { fatal } from '../../../utils/log';

function defaultHandler ( event ) {
	const handler = this._ractive.events[ event.type ];

	handler.fire({
		node: this,
		original: event
	});
}

class DOMEvent {

	constructor ( name, owner ) {

		if ( name.indexOf( '*' ) !== -1 ) {
			fatal( `Only component proxy-events may contain "*" wildcards, <${owner.name} on-${name}="..."/> is not valid` );
		}

		this.name = name;
		this.owner = owner;
		this.node = null;
	}

	listen ( directive ) {
		const node = this.node = this.owner.node,
			  name = this.name;

		if ( !( `on${name}` in node ) ) {
			missingPlugin( name, 'events' );
		}

		node._ractive.events[ name ] = directive;
		node.addEventListener( name, defaultHandler, false );
	}

	unlisten () {
		const node = this.node,
			  name = this.name;

		node.removeEventListener( name, defaultHandler, false );
		node._ractive.events[ name ] = null;
	}
}

class CustomEvent {

	constructor ( eventPlugin, owner ) {
		this.eventPlugin = eventPlugin;
		this.owner = owner;
		this.node = null;
	}

	listen ( directive ) {
		const fire = event => directive.fire( event );
		this.customHandler = this.eventPlugin( this.owner.node, fire );
	}

	unlisten () {
		this.customHandler.teardown();
	}
}

export { DOMEvent, CustomEvent };
