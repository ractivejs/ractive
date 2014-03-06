define([
	'circular',
	'global/css',
	'utils/removeFromArray',
	'shared/getValueFromCheckboxes',
	'shared/resolveRef',
	'shared/getUpstreamChanges',
	'shared/notifyDependants',
	'shared/makeTransitionManager'
], function (
	circular,
	css,
	removeFromArray,
	getValueFromCheckboxes,
	resolveRef,
	getUpstreamChanges,
	notifyDependants,
	makeTransitionManager
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

		instances = [],
		transitionManager;

	runloop = {
		start: function ( instance, callback ) {
			if ( instance && !instances[ instance._guid ] ) {
				instances.push( instance );
				instances[ instances._guid ] = true;
			}

			if ( !flushing ) {
				inFlight += 1;

				// create a new transition manager
				transitionManager = makeTransitionManager( callback );
			}
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

			transitionManager.init();
			transitionManager = transitionManager._previous;
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
			transition._manager = transitionManager;
			transitionManager.push( transition );
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
		},

		// synchronise node detachments with transition ends
		detachWhenReady: function ( thing ) {
			transitionManager.detachQueue.push( thing );
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
		var thing, upstreamChanges, i;

		attemptKeypathResolution();

		i = instances.length;
		while ( i-- ) {
			thing = instances[i];

			if ( thing._changes.length ) {
				upstreamChanges = getUpstreamChanges( thing._changes );
				notifyDependants.multiple( thing, upstreamChanges, true );
			}
		}

		while ( dirty ) {
			dirty = false;

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
		array = unresolved.splice( 0, unresolved.length );
		while ( thing = array.pop() ) {
			if ( thing.keypath ) {
				continue; // it did resolve after all. TODO does this ever happen?
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
