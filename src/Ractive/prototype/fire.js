import fireEvent from '../../events/fireEvent';
import Context from '../../shared/Context';

export default function Ractive$fire ( eventName, ...args ) {
	// watch for reproxy
	if ( args[0] instanceof Context ) {
		const proto = args.shift();
		const ctx = Object.create( proto );
		Object.assign( ctx, proto );
		return fireEvent( this, eventName, ctx, args );
	} else if ( args[0] && typeof args[0] === 'object' && args[0].constructor === Object ) {
		if ( Object.keys(args[0]).length ) { // if first param is a plain object use it as context object
			const proto = args.shift();
			const ctx = Object.create( proto );
			Object.assign( ctx, proto );
			return fireEvent( this, eventName, ctx, args );
		} else { // if object has no key that means that event handler will be called without scope
			args.shift();
			return fireEvent( this, eventName, null, args );
		}
	} else {
		return fireEvent( this, eventName, Context.forRactive( this ), args );
	}
}
