define([
	'state/deferred/transitions'
], function (
	deferredTransitions
) {

	'use strict';

	// TODO can this be neatened up at all?
	return function endCycleUpdate ( ractive ) {
		var deferred, component, focusable, query, decorator, transition, observer;

		deferred = ractive._deferred;

		while ( component = deferred.components.pop() ) {
			endCycleUpdate( component );
		}

		if ( focusable = deferred.focusable ) {
			focusable.focus();
			deferred.focusable = null;
		}

		while ( query = deferred.liveQueries.pop() ) {
			query._sort();
		}

		while ( decorator = deferred.decorators.pop() ) {
			decorator.init();
		}

		while ( transition = deferredTransitions.pop() ) {
			transition.init(); // TODO rename...
		}

		while ( observer = deferred.observers.pop() ) {
			observer.update();
		}

		ractive._updateScheduled = false;
	};

});
