import { normalise } from 'shared/keypaths';
import Observer from './Observer';
import PatternObserver from './PatternObserver';

let emptyObject = {};

export default function getObserverFacade ( ractive, keypath, callback, options ) {
	var observer, isPatternObserver, cancelled, model;

	model = ractive.viewmodel.getModel( keypath );

	options = options || emptyObject;

	// pattern observers are treated differently
	if ( keypath.isPattern ) {
		// TODO: implement pattern observers
		// observer = new PatternObserver( ractive, keypath, callback, options );
		// ractive.viewmodel.patternObservers.push( observer );
		isPatternObserver = true;
	} else {
		observer = new Observer( ractive, model, callback, options );
	}

	observer.init( options.init );
	model.register( observer, isPatternObserver ? 'patternObservers' : 'observers' );

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
				model.unregister( observer, 'patternObservers' );
			} else {
				model.unregister( observer, 'observers' );
			}
			cancelled = true;
		}
	};
}
