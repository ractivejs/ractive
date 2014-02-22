define([
	'circular',
	'global/failedLookups',
	'global/css',
	'utils/removeFromArray',
	'shared/getValueFromCheckboxes',
	'shared/resolveRef'
], function (
	circular,
	failedLookups,
	css,
	removeFromArray,
	getValueFromCheckboxes,
	resolveRef
) {

	'use strict';

	circular.push( function () {
		get = circular.get;
		set = circular.set;
	});

	var runloop,
		get,
		set,

		dirty = false,
		flushing = false,
		pendingCssChanges,
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
		unresolved = [],

		instances = [];

	runloop = {
		start: function ( instance ) {
			if ( !instances[ instance._guid ] ) {
				instances.push( instance );
				instances[ instances._guid ] = true;
			}

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

		trigger: function () {
			if ( inFlight || flushing ) {
				attemptKeypathResolution();
				return;
			}

			flushing = true;
			flushChanges();
			flushing = false;

			land();
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

		scheduleCssUpdate: function () {
			// if runloop isn't currently active, we need to trigger change immediately
			if ( !inFlight && !flushing ) {
				// TODO does this ever happen?
				css.update();
			} else {
				pendingCssChanges = true;
			}
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

	circular.runloop = runloop;
	return runloop;


	function land () {
		var thing, changedKeypath, changeHash;

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

		// Change events are fired last
		while ( thing = instances.pop() ) {
			instances[ thing._guid ] = false;
			thing._transitionManager = null;

			if ( thing._changes.length ) {
				changeHash = {};

				while ( changedKeypath = thing._changes.pop() ) {
					changeHash[ changedKeypath ] = get( thing, changedKeypath );
				}

				thing.fire( 'change', changeHash );
			}
		}

		if ( pendingCssChanges ) {
			css.update();
			pendingCssChanges = false;
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
				set( thing.root, thing.keypath, getValueFromCheckboxes( thing.root, thing.keypath ) );
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

			keypath = resolveRef( thing.root, thing.ref, thing.parentFragment );

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
