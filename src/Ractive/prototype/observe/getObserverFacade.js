import normaliseKeypath from 'utils/normaliseKeypath';
import Observer from 'Ractive/prototype/observe/Observer';
import PatternObserver from 'Ractive/prototype/observe/PatternObserver';

var wildcard = /\*/, emptyObject = {};

export default function getObserverFacade ( ractive, keypath, callback, options ) {
	var observer, isPatternObserver, cancelled;

	keypath = normaliseKeypath( keypath );
	options = options || emptyObject;

	// pattern observers are treated differently
	if ( wildcard.test( keypath ) ) {
		observer = new PatternObserver( ractive, keypath, callback, options );
		ractive.viewmodel.patternObservers.push( observer );
		isPatternObserver = true;
	} else {
		observer = new Observer( ractive, keypath, callback, options );
	}

	ractive.viewmodel.register( keypath, observer, isPatternObserver ? 'patternObservers' : 'observers' );
	observer.init( options.init );

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
				ractive.viewmodel.unregister( keypath, observer, 'patternObservers' );
			} else {
				ractive.viewmodel.unregister( keypath, observer, 'observers' );
			}
			cancelled = true;
		}
	};
}
