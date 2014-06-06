import circular from 'circular';
import css from 'global/css';
import removeFromArray from 'utils/removeFromArray';
import getValueFromCheckboxes from 'shared/getValueFromCheckboxes';
import resolveRef from 'shared/resolveRef';
import getUpstreamChanges from 'shared/getUpstreamChanges';
import notifyDependants from 'shared/notifyDependants';
import makeTransitionManager from 'shared/makeTransitionManager';

var runloop,

	dirty = false,
	flushing = false,
	pendingCssChanges,

	lockedAttributes = [],

	checkboxKeypaths = {},
	checkboxBindings = [],
	unresolved = [],

	modelUpdates = [],
	viewUpdates = [],
	postViewUpdateTasks = [],
	postModelUpdateTasks = [],

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
		do {
			flushChanges();
		} while ( dirty );
		flushing = false;

		transitionManager.init();
		transitionManager = transitionManager._previous;
	},

	addInstance: function ( instance ) {
		if ( instance && !instances[ instance._guid ] ) {
			instances.push( instance );
			instances[ instances._guid ] = true;
		}
	},

	registerTransition: function ( transition ) {
		transition._manager = transitionManager;
		transitionManager.push( transition );
	},

	viewUpdate: function ( thing ) {
		dirty = true;
		viewUpdates.push( thing );
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
	modelUpdate: function ( thing, remove ) {
		if ( remove ) {
			removeFromArray( modelUpdates, thing );
		} else {
			dirty = true;
			modelUpdates.push( thing );
		}
	},

	// TODO this is wrong - inputs should be grouped by instance
	addCheckboxBinding: function ( checkboxBinding ) {
		if ( !checkboxKeypaths[ checkboxBinding.keypath ] ) {
			dirty = true;
			checkboxBindings.push( checkboxBinding );
			checkboxKeypaths[ checkboxBinding.keypath ] = true;
		}
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
	},

	afterModelUpdate: function ( task ) {
		dirty = true;
		postModelUpdateTasks.push( task );
	},

	afterViewUpdate: function ( task ) {
		dirty = true;
		postViewUpdateTasks.push( task );
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

		while ( thing = modelUpdates.pop() ) {
			thing.update();
			thing.dirty = false;
		}

		while ( thing = postModelUpdateTasks.pop() ) {
			thing();
		}

		while ( thing = checkboxBindings.pop() ) {
			thing.root.viewmodel.set( thing.keypath, getValueFromCheckboxes( thing.root, thing.keypath ) );
			checkboxKeypaths[ thing.keypath ] = false;
		}

		attemptKeypathResolution();
	}

	// Now that changes have been fully propagated, we can update the DOM
	// and complete other tasks
	while ( thing = viewUpdates.pop() ) {
		thing.update();
	}

	while ( thing = postViewUpdateTasks.pop() ) {
		thing();
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
				changeHash[ changedKeypath ] = thing.viewmodel.get( changedKeypath );
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
