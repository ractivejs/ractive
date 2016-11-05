import fireEvent from './fireEvent';

export default class Hook {
	constructor ( event ) {
		this.event = event;
		this.method = 'on' + event;
	}

	fire ( ractive, arg ) {
		if ( ractive[ this.method ] ) {
			arg ? ractive[ this.method ]( arg ) : ractive[ this.method ]();
		}

		const options = { args: [] };
		if ( arg ) options.args.push( arg );
		options.args.push( ractive );
		fireEvent( ractive, this.event, options );
	}
}
