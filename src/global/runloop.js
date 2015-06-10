import Hook from 'Ractive/prototype/shared/hooks/Hook';
import { addToArray, removeFromArray } from 'utils/array';
import Promise from 'utils/Promise';
import TransitionManager from './TransitionManager';

var batch, runloop, unresolved = [], changeHook = new Hook( 'change' );

runloop = {
	start: function ( instance, returnPromise ) {
		var promise, fulfilPromise;

		if ( returnPromise ) {
			promise = new Promise( f => ( fulfilPromise = f ) );
		}

		batch = {
			previousBatch: batch,
			transitionManager: new TransitionManager( fulfilPromise, batch && batch.transitionManager ),
			fragments: [],
			tasks: [],
			ractives: [],
			instance: instance
		};

		if ( instance ) {
			batch.ractives.push( instance );
		}

		return promise;
	},

	end: function () {
		flushChanges();

		batch.transitionManager.init();
		if ( !batch.previousBatch && !!batch.instance ) batch.instance.viewmodel.changes = [];
		batch = batch.previousBatch;
	},

	addRactive: function ( ractive ) {
		if ( batch ) {
			addToArray( batch.ractives, ractive );
		}
	},

	addFragment ( fragment ) {
		addToArray( batch.fragments, fragment );
	},

	registerTransition: function ( transition ) {
		transition._manager = batch.transitionManager;
		batch.transitionManager.add( transition );
	},

	registerDecorator: function ( decorator ) {
		batch.transitionManager.addDecorator( decorator );
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

	scheduleTask: function ( task, postRender ) {
		var _batch;

		if ( !batch ) {
			task();
		} else {
			_batch = batch;
			while ( postRender && _batch.previousBatch ) {
				// this can't happen until the DOM has been fully updated
				// otherwise in some situations (with components inside elements)
				// transitions and decorators will initialise prematurely
				_batch = _batch.previousBatch;
			}

			_batch.tasks.push( task );
		}
	}
};

export default runloop;

function flushChanges () {
	var i, thing, changeHash;

	// i = batch.ractives.length;
	// while ( i-- ) {
	// 	thing = batch.ractives[i];
	// 	changeHash = thing.viewmodel.applyChanges();
	//
	// 	if ( changeHash ) {
	// 		//changeHook.fire( thing, changeHash );
	// 	}
	// }
	// batch.ractives.length = 0;

	// Now that changes have been fully propagated, we can update the DOM
	// and complete other tasks
	i = batch.fragments.length;
	while ( i-- ) {
		thing = batch.fragments[i];
		thing.update();
	}
	batch.fragments.length = 0;



	for ( i = 0; i < batch.tasks.length; i += 1 ) {
		batch.tasks[i]();
	}
	batch.tasks.length = 0;

	// If updating the view caused some model blowback - e.g. a triple
	// containing <option> elements caused the binding on the <select>
	// to update - then we start over
	//if ( batch.ractives.length ) return flushChanges();
}
