import fireEvent from './fireEvent';
import getRactiveContext from '../shared/getRactiveContext';

export default class Hook {
	constructor ( event ) {
		this.event = event;
		this.method = 'on' + event;
	}

	fire ( ractive, arg ) {
		const context = getRactiveContext( ractive );

		if ( ractive[ this.method ] ) {
			arg ? ractive[ this.method ]( context, arg ) : ractive[ this.method ]( context );
		}

		fireEvent( ractive, this.event, context, arg ? [ arg, ractive ] : [ ractive ] );
	}
}
