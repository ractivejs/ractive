export default class RactiveEvent {
	constructor ( component, name ) {
		this.component = component;
		this.name = name;
		this.handler = null;
	}

	listen ( directive ) {
		const ractive = this.component.instance;

		this.handler = ractive.on( this.name, function ( ...args ) {
			this.component = ractive;

			directive.fire( this, args );

			// cancel bubbling
			return false;
		});
	}

	unlisten () {
		this.handler.cancel();
	}
}
