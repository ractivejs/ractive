import circular from 'circular';
import removeFromArray from 'utils/removeFromArray';
import resolveRef from 'shared/resolveRef';
import makeTransitionManager from 'shared/makeTransitionManager';

var batch, runloop, unresolved = [];

runloop = {
	start: function ( instance, callback ) {
		batch = {
			previousBatch: batch,
			transitionManager: makeTransitionManager( callback, batch && batch.transitionManager ),
			views: [],
			tasks: [],
			viewmodels: [ instance.viewmodel ]
		};
	},

	end: function () {
		flushChanges();

		batch.transitionManager.init();
		batch = batch.previousBatch;
	},

	addViewmodel: function ( viewmodel ) {
		if ( batch ) {
			if ( batch.viewmodels.indexOf( viewmodel ) === -1 ) {
				batch.viewmodels.push( viewmodel );
			}
		} else {
			viewmodel.applyChanges();
		}
	},

	registerTransition: function ( transition ) {
		transition._manager = batch.transitionManager;
		batch.transitionManager.push( transition );
	},

	addView: function ( view ) {
		batch.views.push( view );
	},

	addUnresolved: function ( thing ) {
		unresolved.push( thing );
	},

	removeUnresolved: function ( thing ) {
		removeFromArray( unresolved, thing );
	},

	// synchronise node detachments with transition ends
	detachWhenReady: function ( thing ) {
		batch.transitionManager.detachQueue.push( thing );
	},

	scheduleTask: function ( task ) {
		if ( !batch ) {
			task();
		} else {
			batch.tasks.push( task );
		}
	}
};

circular.runloop = runloop;
export default runloop;

function flushChanges () {
	var i, thing, changeHash;

	for ( i = 0; i < batch.viewmodels.length; i += 1 ) {
		thing = batch.viewmodels[i];
		changeHash = thing.applyChanges();

		if ( changeHash ) {
			thing.ractive.fire( 'change', changeHash );
		}
	}
	batch.viewmodels.length = 0;

	attemptKeypathResolution();

	// Now that changes have been fully propagated, we can update the DOM
	// and complete other tasks
	for ( i = 0; i < batch.views.length; i += 1 ) {
		batch.views[i].update();
	}
	batch.views.length = 0;

	for ( i = 0; i < batch.tasks.length; i += 1 ) {
		batch.tasks[i]();
	}
	batch.tasks.length = 0;

	// If updating the view caused some model blowback - e.g. a triple
	// containing <option> elements caused the binding on the <select>
	// to update - then we start over
	if ( batch.viewmodels.length ) return flushChanges();
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
