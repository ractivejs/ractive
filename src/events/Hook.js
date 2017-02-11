import fireEvent from './fireEvent';
import extendContext from '../shared/extendContext';

export default class Hook {
	constructor ( event ) {
		this.event = event;
		this.method = 'on' + event;
	}

	fire ( ractive, arg ) {
		if ( ractive[ this.method ] ) {
			arg ? ractive[ this.method ]( arg ) : ractive[ this.method ]();
		}

		const args = [];
		if ( arg ) args.push( arg );
		args.push( ractive );
		fireEvent( extendContext( ractive ), this.event, args );
	}
}
