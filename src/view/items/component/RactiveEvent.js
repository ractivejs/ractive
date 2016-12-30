export default class RactiveEvent {

	constructor ( ractive, name ) {
		this.ractive = ractive;
		this.name = name;
		this.handler = null;
	}

	listen ( directive ) {
		const ractive = this.ractive;

		this.handler = ractive.on( this.name, function () {
			let event;

			// semi-weak test, but what else? tag the event obj ._isEvent ?
			if ( arguments.length && arguments[0] && arguments[0].node ) {
				event = Array.prototype.shift.call( arguments );
				event.component = ractive;
			}

			const args = Array.prototype.slice.call( arguments );
			directive.fire( event, args );

			// cancel bubbling
			return false;
		});
	}

	unlisten () {
		this.handler.cancel();
	}
}
