import circular from 'circular';
import removeFromArray from 'utils/removeFromArray';
import Promise from 'utils/Promise';
import resolveRef from 'shared/resolveRef';
import TransitionManager from 'global/TransitionManager';

var batch, runloop, unresolved = [];

runloop = {
	start: function ( instance, returnPromise ) {
		var promise, fulfilPromise;

		if ( returnPromise ) {
			promise = new Promise( f => ( fulfilPromise = f ) );
		}

		batch = {
			previousBatch: batch,
			transitionManager: new TransitionManager( fulfilPromise, batch && batch.transitionManager ),
			views: [],
			tasks: [],
			viewmodels: []
		};

		if ( instance ) {
			batch.viewmodels.push( instance.viewmodel );
		}

		return promise;
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
		batch.transitionManager.add( transition );
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
	var i, item, keypath, resolved;

	i = unresolved.length;

	// see if we can resolve any unresolved references
	while ( i-- ) {
		item = unresolved[i];

		if ( item.keypath ) {
			// it resolved some other way. TODO how? two-way binding? Seems
			// weird that we'd still end up here
			unresolved.splice( i, 1 );
		}

		if ( keypath = resolveRef( item.root, item.ref, item.parentFragment ) ) {
			( resolved || ( resolved = [] ) ).push({
				item: item,
				keypath: keypath
			});

			unresolved.splice( i, 1 );
		}
	}

	if ( resolved ) {
		resolved.forEach( resolve );
	}
}

function resolve ( resolved ) {
	resolved.item.resolve( resolved.keypath );
}
