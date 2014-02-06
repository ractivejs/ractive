define([
	'state/failedLookups',
	'state/pendingResolution',
	'shared/getValueFromCheckboxes'
], function (
	failedLookups,
	pendingResolution,
	getValueFromCheckboxes
) {

	'use strict';

	var dirty = false,
		flushing = false,
		inFlight = 0,
		toFocus = null,
		liveQueries = [],
		decorators = [],
		transitions = [],
		observers = [],
		attributes = [],
		evaluators = [],
		selectValues = [],
		checkboxKeypaths = {},
		checkboxes = [],
		radios = [];

	return {
		start: function () {
			if ( flushing ) {
				return;
			}

			inFlight += 1;
		},

		end: function () {
			if ( flushing ) {
				pendingResolution.check();
				return;
			}

			if ( !--inFlight ) {
				flushing = true;
				flushChanges();
				flushing = false;
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
		},

		addAttribute: function ( attribute ) {
			attributes.push( attribute );
		},

		// changes that may cause additional changes...
		addEvaluator: function ( evaluator ) {
			dirty = true;
			evaluators.push( evaluator );
		},

		addSelectValue: function ( selectValue ) {
			dirty = true;
			selectValues.push( selectValue );
		},

		addCheckbox: function ( checkbox ) {
			if ( !checkboxKeypaths[ checkbox.keypath ] ) {
				dirty = true;
				checkboxes.push( checkbox );
			}
		},

		addRadio: function ( radio ) {
			dirty = true;
			radios.push( radio );
		}
	};

	function land () {
		var thing;

		if ( toFocus ) {
			toFocus.focus();
			toFocus = null;
		}

		while ( thing = attributes.pop() ) {
			thing.update().deferred = false;
		}

		while ( thing = liveQueries.pop() ) {
			thing._sort();
		}

		while ( thing = decorators.pop() ) {
			thing.init();
		}

		while ( thing = transitions.pop() ) {
			thing.init();
		}

		while ( thing = observers.pop() ) {
			thing.update();
		}
	}

	function flushChanges () {
		var thing;

		pendingResolution.check();

		while ( dirty ) {
			dirty = false;

			failedLookups.purge();

			while ( thing = evaluators.pop() ) {
				thing.update().deferred = false;
			}

			while ( thing = selectValues.pop() ) {
				thing.deferredUpdate();
			}

			while ( thing = checkboxes.pop() ) {
				thing.root.set( thing.keypath, getValueFromCheckboxes( thing.root, thing.keypath ) );
			}

			while ( thing = radios.pop() ) {
				thing.update();
			}
		}
	}

});
