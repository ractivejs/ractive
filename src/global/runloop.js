import Hook from 'events/Hook';
import { addToArray, removeFromArray } from 'utils/array';
import Promise from 'utils/Promise';
import TransitionManager from './TransitionManager';

var batch, runloop, unresolved = [], changeHook = new Hook( 'change' );

runloop = {
	start ( instance, returnPromise ) {
		var promise, fulfilPromise;

		if ( returnPromise ) {
			promise = new Promise( f => ( fulfilPromise = f ) );
		}

		batch = {
			previousBatch: batch,
			transitionManager: new TransitionManager( fulfilPromise, batch && batch.transitionManager ),
			fragments: [],
			tasks: [],
			immediateObservers: [],
			deferredObservers: [],
			instance: instance
		};

		return promise;
	},

	end () {
		flushChanges();

		batch.transitionManager.init();
		if ( !batch.previousBatch && !!batch.instance ) batch.instance.viewmodel.changes = [];
		batch = batch.previousBatch;
	},

	addFragment ( fragment ) {
		addToArray( batch.fragments, fragment );
	},

	addObserver ( observer, defer ) {
		addToArray( defer ? batch.deferredObservers : batch.immediateObservers, observer );
	},

	registerTransition ( transition ) {
		transition._manager = batch.transitionManager;
		batch.transitionManager.add( transition );
	},

	registerDecorator ( decorator ) {
		batch.transitionManager.addDecorator( decorator );
	},

	// synchronise node detachments with transition ends
	detachWhenReady ( thing ) {
		batch.transitionManager.detachQueue.push( thing );
	},

	scheduleTask ( task, postRender ) {
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

function dispatch ( observer ) {
	observer.dispatch();
}

function flushChanges () {
	var i, thing, changeHash;

	batch.immediateObservers.forEach( dispatch );

	// Now that changes have been fully propagated, we can update the DOM
	// and complete other tasks
	i = batch.fragments.length;
	while ( i-- ) {
		thing = batch.fragments[i];
		thing.update();
	}
	batch.fragments.length = 0;

	batch.transitionManager.start();

	batch.deferredObservers.forEach( dispatch );

	for ( i = 0; i < batch.tasks.length; i += 1 ) {
		batch.tasks[i]();
	}
	batch.tasks.length = 0;

	// If updating the view caused some model blowback - e.g. a triple
	// containing <option> elements caused the binding on the <select>
	// to update - then we start over
	//if ( batch.ractives.length ) return flushChanges();
}
