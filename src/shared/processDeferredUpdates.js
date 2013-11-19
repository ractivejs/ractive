define([ 'shared/getValueFromCheckboxes' ], function ( getValueFromCheckboxes ) {

	'use strict';

	// TODO can this be neatened up at all?
	return function ( ractive, initialRender ) {
		var evaluator, attribute, keypath;

		while ( ractive._defEvals.length ) {
			 evaluator = ractive._defEvals.pop();
			 evaluator.update().deferred = false;
		}

		while ( ractive._defSelectValues.length ) {
			ractive._defSelectValues.pop().deferredUpdate();
		}

		while ( ractive._defAttrs.length ) {
			attribute = ractive._defAttrs.pop();
			attribute.update().deferred = false;
		}

		while ( ractive._defCheckboxes.length ) {
			keypath = ractive._defCheckboxes.pop();
			ractive.set( keypath, getValueFromCheckboxes( ractive, keypath ) );
		}

		while ( ractive._defRadios.length ) {
			ractive._defRadios.pop().update();
		}

		while ( ractive._defObservers.length ) {
			ractive._defObservers.pop().update( true );
		}

		if ( !initialRender ) {
			while ( ractive._defTransitions.length ) {
				ractive._defTransitions.pop().init(); // TODO rename...
			}
		}
	};

});