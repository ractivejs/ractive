import { normalise } from 'shared/keypaths';
import Observer from './Observer';
import PatternObserver from './PatternObserver';

const wildcard = /\*/;

export default function getObserverFacade ( ractive, keypath, callback, options = { context: ractive, init: true } ) {

	var observer, isPattern, cancelled;

	if( !options.context ) {
		options.context = ractive;
	}

	if( options.init !== false ) {
		options.init = true;
	}

	// pattern observers are treated differently
	if ( wildcard.test( keypath ) ) {
		observer = new PatternObserver( ractive.viewmodel.root, keypath, callback, options );
	} else {
		let context = ractive.viewmodel.getContext( keypath );
		observer = new Observer( context, callback, options );
	}

	let facade = {
		cancel () {
			var index;

			if ( cancelled ) {
				return;
			}

			observer.cancel();
		}
	};

	ractive._observers.push( facade );
	return facade;
}
