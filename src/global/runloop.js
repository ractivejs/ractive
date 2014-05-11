import circular from 'circular';
import css from 'global/css';
import removeFromArray from 'utils/removeFromArray';
import getValueFromCheckboxes from 'shared/getValueFromCheckboxes';
import resolveRef from 'shared/resolveRef';
import getUpstreamChanges from 'shared/getUpstreamChanges';
import notifyDependants from 'shared/notifyDependants';
import makeTransitionManager from 'shared/makeTransitionManager';

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
	toFocus = null,

	liveQueries = [],
	decorators = [],
	intros = [],
	outros = [],
	observers = [],
	updateQueue = [],
	lockedAttributes = [],

	evaluators = [],
	computations = [],
	dirtySelects = [],
	selectBindings = [],
	checkboxKeypaths = {},
	checkboxBindings = [],
	radios = [],
	unresolved = [],

	instances = [],
	transitionManager;

runloop = {
	start: function ( instance, callback ) {
		this.addInstance( instance );

		if ( !flushing ) {
			// create a new transition manager
			transitionManager = makeTransitionManager( callback, transitionManager );
		}
	},

	end: function () {
		if ( flushing ) {
			attemptKeypathResolution();
			return;
		}

		flushing = true;
		flushChanges();
		flushing = false;

		transitionManager.init();
		transitionManager = transitionManager._previous;
	},

	focus: function ( node ) {
		toFocus = node;
	},

	addInstance: function ( instance ) {
		if ( instance && !instances[ instance._guid ] ) {
			instances.push( instance );
			instances[ instances._guid ] = true;
		}
	},

	addLiveQuery: function ( query ) {
		liveQueries.push( query );
	},

	addDecorator: function ( decorator ) {
		decorators.push( decorator );
	},

	addIntro: function ( intro ) {
		intro._manager = transitionManager;
		transitionManager.push( intro );
		intros.push( intro );
	},

	addOutro: function ( outro ) {
		outro._manager = transitionManager;
		transitionManager.push( outro );
		outros.push( outro );
	},

	addObserver: function ( observer ) {
		observers.push( observer );
	},

	addUpdate: function ( thing ) {
		updateQueue.push( thing );
	},

	lockAttribute: function ( attribute ) {
		attribute.locked = true;
		lockedAttributes.push( attribute );
	},

	scheduleCssUpdate: function () {
		// if runloop isn't currently active, we need to trigger change immediately
		if ( !flushing ) {
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

	addComputation: function ( thing ) {
		dirty = true;
		computations.push( thing );
	},

	addDirtySelect: function ( select ) {
		dirty = true;
		dirtySelects.push( select );
	},

	addSelectBinding: function ( selectBinding ) {
		dirty = true;
		selectBindings.push( selectBinding );
	},

	addCheckboxBinding: function ( checkboxBinding ) {
		if ( !checkboxKeypaths[ checkboxBinding.keypath ] ) {
			dirty = true;
			checkboxBindings.push( checkboxBinding );
			checkboxKeypaths[ checkboxBinding.keypath ] = true;
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
export default runloop;

function flushChanges () {
	var thing, upstreamChanges, i, changeHash, changedKeypath;

	i = instances.length;
	while ( i-- ) {
		thing = instances[i];

		if ( thing._changes.length ) {
			upstreamChanges = getUpstreamChanges( thing._changes );
			notifyDependants.multiple( thing, upstreamChanges, true );
		}
	}

	attemptKeypathResolution();

	// These changes may have knock-on effects, so we need to keep
	// looping until the system is settled
	while ( dirty ) {
		dirty = false;

		while ( thing = computations.pop() ) {
			thing.update();
		}

		while ( thing = evaluators.pop() ) {
			thing.update().deferred = false;
		}

		while ( thing = dirtySelects.pop() ) {
			thing.sync();
			thing.dirty = false;
		}

		while ( thing = selectBindings.pop() ) {
			thing.updateModel();
		}

		while ( thing = checkboxBindings.pop() ) {
			set( thing.root, thing.keypath, getValueFromCheckboxes( thing.root, thing.keypath ) );
			checkboxKeypaths[ thing.keypath ] = false;
		}

		while ( thing = radios.pop() ) {
			thing.handleChange();
		}
	}

	// Now that changes have been fully propagated, we can update the DOM
	// and complete other tasks
	if ( toFocus ) {
		toFocus.focus();
		toFocus = null;
	}

	while ( thing = updateQueue.pop() ) {
		thing.update();
	}

	while ( thing = liveQueries.pop() ) {
		thing._sort();
	}

	while ( thing = decorators.pop() ) {
		thing.init();
	}

	while ( thing = intros.pop() ) {
		thing.start( true );
	}

	while ( thing = outros.pop() ) {
		thing.start( false );
	}

	while ( thing = observers.pop() ) {
		thing.update();
	}

	// Unlock attributes (twoway binding)
	while ( thing = lockedAttributes.pop() ) {
		thing.locked = false;
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

function attemptKeypathResolution () {
	var array, thing, keypath;

	if ( !unresolved.length ) {
		return;
	}

	// see if we can resolve any unresolved references
	array = unresolved.splice( 0, unresolved.length );
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
