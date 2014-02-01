define( function () {

	'use strict';

	var inFlight = 0,
		toFocus = null,
		liveQueries = [],
		decorators = [],
		transitions = [],
		observers = [];

	return {
		start: function () {
			inFlight += 1;
		},

		end: function () {
			if ( !--inFlight ) {
				land();
			}
		},

		focus: function ( node ) {
			toFocus = node;
		},

		addLiveQuery: function ( query ) {
			liveQueries.push( query );
		},

		addDecorator: function ( decorator ) {
			decorators.push( decorator );
		},

		addTransition: function ( transition ) {
			transitions.push( transition );
		},

		addObserver: function ( observer ) {
			observers.push( observer );
		}
	};

	function land () {
		var query, decorator, transition, observer;

		if ( toFocus ) {
			toFocus.focus();
			toFocus = null;
		}

		while ( query = liveQueries.pop() ) {
			query._sort();
		}

		while ( decorator = decorators.pop() ) {
			decorator.init();
		}

		while ( transition = transitions.pop() ) {
			transition.init();
		}

		while ( observer = observers.pop() ) {
			observer.update();
		}
	}

});