import { normalise } from 'shared/keypaths';
import getObserver from './Observer';
import PatternObserver from './PatternObserver';

const wildcard = /\*/;

export default function getObserverFacade ( ractive, keypath, callback, options = { context: ractive, init: true } ) {

	var observer;

	if( !options.context ) {
		options.context = ractive;
	}

	if( options.init !== false ) {
		options.init = true;
	}

	keypath = normalise( keypath );

	// pattern observers are treated differently
	if ( wildcard.test( keypath ) ) {
		observer = new PatternObserver( ractive.viewmodel.root, keypath, callback, options );
	} else {
		let context = ractive.viewmodel.getContext( keypath );
		observer = new getObserver( context, callback, options );
	}

	const facade = new ObserverFacade( observer );
	ractive._observers.push( facade );
	return facade;
}

class ObserverFacade {

	constructor ( observer ) {
		this.observer = observer;
		this.cancelled = false;
	}

	cancel () {
		if ( this.cancelled ) {
			return;
		}
		this.cancelled = true;
		this.observer.cancel();
	}
}
