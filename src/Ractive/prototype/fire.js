import fireEvent from '../../events/fireEvent';
import Context from '../../shared/Context';

export default function Ractive$fire ( eventName, ...args ) {
	// watch for reproxy
	if ( args[0] instanceof Context ) {
		return fireEvent( this, eventName, Context.forRactive( this, args.shift() ), args );
	} else {
		return fireEvent( this, eventName, Context.forRactive( this ), args );
	}
}
