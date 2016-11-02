export default class Hook {
	constructor ( event ) {
		this.event = event;
		this.method = 'on' + event;
	}

	call ( method, ractive, arg ) {
		if ( ractive[ method ] ) {
			arg ? ractive[ method ]( arg ) : ractive[ method ]();
			return true;
		}
	}

	fire ( ractive, arg ) {
		this.call( this.method, ractive, arg );

		// TODO should probably use internal method, in case ractive.fire was overwritten
		arg ? ractive.fire( this.event, arg ) : ractive.fire( this.event );
	}
}
