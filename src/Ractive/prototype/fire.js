import fireEvent from '../../events/fireEvent';
import Context from '../../shared/Context';

export default function Ractive$fire ( eventName, ...args ) {
	// watch for reproxy
	if ( args[0] instanceof Context ) {
		const proto = args.shift();
		const ctx = Object.create( proto );
		Object.assign( ctx, proto );
		return fireEvent( this, eventName, ctx, args );
	} else {
		return fireEvent( this, eventName, Context.forRactive( this ), args );
	}
}
