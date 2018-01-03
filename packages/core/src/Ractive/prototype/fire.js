import fireEvent from '../../events/fireEvent';
import Context from '../../shared/Context';

export default function Ractive$fire ( eventName, ...args ) {
	let ctx;

	// watch for reproxy
	if ( args[0] instanceof Context  ) {
		const proto = args.shift();
		ctx = Object.create( proto );
		Object.assign( ctx, proto );
	} else if ( typeof args[0] === 'object' && args[0].constructor === Object ) {
		ctx = Context.forRactive( this, args.shift() );
	} else {
		ctx = Context.forRactive( this );
	}


	return fireEvent( this, eventName, ctx, args );
}
