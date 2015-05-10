import { normalise } from 'shared/keypaths';
import Observer from './Observer';
import PatternObserver from './PatternObserver';

let emptyObject = {};

export default function getObserverFacade ( ractive, keypath, callback, options ) {

	var observer, isPatternObserver, cancelled;

	const context = ractive.viewmodel.getModel( keypath );

	options = options || emptyObject;
	options.context = options.context || ractive;

	// pattern observers are treated differently
	if ( keypath.isPattern ) {
		// TODO: implement pattern observers
		// observer = new PatternObserver( ractive, keypath, callback, options );
		// ractive.viewmodel.patternObservers.push( observer );
		isPatternObserver = true;
	} else {
		observer = new Observer( context, callback, options );
	}

	observer.init( options.init );
	context.registerObserver( observer );

	// This flag allows observers to initialise even with undefined values
	observer.ready = true;

	let facade = {
		cancel () {
			var index;

			if ( cancelled ) {
				return;
			}

			if ( isPatternObserver ) {
				index = ractive.viewmodel.patternObservers.indexOf( observer );

				ractive.viewmodel.patternObservers.splice( index, 1 );
				context.unregisterObserver( observer );
			} else {
				context.unregisterObserver( observer );
			}
			cancelled = true;
		}
	};

	ractive._observers.push( facade );
	return facade;
}
