define([
	'state/failedLookups',
	'utils/removeFromArray',
	'shared/getValueFromCheckboxes',
	'shared/resolveRef'
], function (
	failedLookups,
	removeFromArray,
	getValueFromCheckboxes,
	resolveRef
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
		radios = [],
		unresolved = [];

	return {
		start: function () {
			if ( flushing ) {
				return;
			}

			inFlight += 1;
		},

		end: function () {
			if ( flushing ) {
				attemptKeypathResolution();
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
		},

		addUnresolved: function ( thing ) {
			dirty = true;
			unresolved.push( thing );
		},

		removeUnresolved: function ( thing ) {
			removeFromArray( unresolved, thing );
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

		attemptKeypathResolution();

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

	function attemptKeypathResolution () {
		var array, thing, keypath;

		if ( !unresolved.length ) {
			return;
		}

		// see if we can resolve any unresolved references
		array = unresolved.splice( 0 );
		while ( thing = array.pop() ) {
			if ( thing.keypath ) {
				continue; // it did resolve after all
			}

			keypath = resolveRef( thing.root, thing.ref, thing.contextStack );

			if ( keypath !== undefined ) {
				// If we've resolved the keypath, we can initialise this item
				thing.resolve( keypath );
			} else {
				// If we can't resolve the reference, try again next time
				unresolved.push( thing );
			}
		}
	}

});
