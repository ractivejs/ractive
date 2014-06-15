	import circular from 'circular';
import css from 'global/css';
import removeFromArray from 'utils/removeFromArray';
import resolveRef from 'shared/resolveRef';
import makeTransitionManager from 'shared/makeTransitionManager';

var runloop,

	dirty = false,
	flushing = false,
	pendingCssChanges,

	lockedAttributes = [],

	unresolved = [],

	viewUpdates = [],
	postViewUpdateTasks = [],
	postModelUpdateTasks = [],

	viewmodels = [],
	transitionManager;

runloop = {
	start: function ( instance, callback ) {
		this.addViewmodel( instance.viewmodel );

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

	addViewmodel: function ( viewmodel ) {
		if ( viewmodel && viewmodels.indexOf( viewmodel ) === -1 ) {
			viewmodels.push( viewmodel );
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

	while ( thing = viewmodels.shift() ) {
		thing.applyChanges();
	}

	attemptKeypathResolution();

	// These changes may have knock-on effects, so we need to keep
	// looping until the system is settled
	while ( dirty ) {
		dirty = false;

		while ( thing = postModelUpdateTasks.pop() ) {
			thing();
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

	if ( pendingCssChanges ) {
		css.update();
		pendingCssChanges = false;
	}

	console.groupEnd();
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
