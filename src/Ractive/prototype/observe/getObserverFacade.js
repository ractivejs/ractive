import { normalise } from 'shared/keypaths';
import Observer from './Observer';
import PatternObserver from './PatternObserver';

var wildcard = /\*/, emptyObject = {};

export default function getObserverFacade ( ractive, keypath, callback, options ) {
	var observer, isPatternObserver, cancelled;

	keypath = ractive.viewmodel.getKeypath( normalise( keypath ) );
	options = options || emptyObject;

	// pattern observers are treated differently
	if ( wildcard.test( keypath.str ) ) {
		observer = new PatternObserver( ractive, keypath, callback, options );
		ractive.viewmodel.patternObservers.push( observer );
		isPatternObserver = true;
	} else {
		observer = new Observer( ractive, keypath, callback, options );
	}

	observer.init( options.init );
	keypath.register( observer, isPatternObserver ? 'patternObservers' : 'observers' );

	// This flag allows observers to initialise even with undefined values
	observer.ready = true;

	return {
		cancel: function () {
			var index;

			if ( cancelled ) {
				return;
			}

			if ( isPatternObserver ) {
				index = ractive.viewmodel.patternObservers.indexOf( observer );

				ractive.viewmodel.patternObservers.splice( index, 1 );
				keypath.unregister( observer, 'patternObservers' );
			} else {
				keypath.unregister( observer, 'observers' );
			}
			cancelled = true;
		}
	};
}
