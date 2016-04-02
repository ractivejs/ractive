import Hook from '../events/Hook';
import { addToArray } from '../utils/array';
import Promise from '../utils/Promise';
import TransitionManager from './TransitionManager';

const changeHook = new Hook( 'change' );

let batch;

const runloop = {
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
			instance: instance,
			models: []
		};

		return promise;
	},

	end () {
		flushChanges();
		batch = batch.previousBatch;
	},

	addFragment ( fragment ) {
		addToArray( batch.fragments, fragment );
	},

	addModel ( model ) {
		if ( batch ) addToArray( batch.models, model );
	},

	addObserver ( observer, defer ) {
		addToArray( defer ? batch.deferredObservers : batch.immediateObservers, observer );
	},

	models () { return batch ? batch.currentModels || batch.models : []; },

	registerTransition ( transition ) {
		transition._manager = batch.transitionManager;
		batch.transitionManager.add( transition );
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
	let which = batch.currentModels = batch.models;
	batch.models = [];
	fireChangeEvents( which );

	which = batch.immediateObservers;
	batch.immediateObservers = [];
	which.forEach( dispatch );

	// Now that changes have been fully propagated, we can update the DOM
	// and complete other tasks
	let i = batch.fragments.length;
	which = batch.fragments;
	batch.fragments = [];

	while ( i-- ) {
		which[i].update();
	}

	batch.transitionManager.start();

	which = batch.deferredObservers;
	batch.deferredObservers = [];
	which.forEach( dispatch );

	const tasks = batch.tasks;
	batch.tasks = [];

	for ( i = 0; i < tasks.length; i += 1 ) {
		tasks[i]();
	}

	// If updating the view caused some model blowback - e.g. a triple
	// containing <option> elements caused the binding on the <select>
	// to update - then we start over
	if ( batch.fragments.length || batch.immediateObservers.length || batch.deferredObservers.length || batch.models.length ) return flushChanges();
}

function fireChangeEvents ( models ) {
	const ractives = [];
	const changes = {};

	let i = models.length;
	while ( i-- ) {
		let model = models[i], ractive = model.root.ractive;

		// some models have no instance (@global)
		if ( !ractive ) continue;

		if ( ractives.indexOf( ractive ) === -1 ) {
			ractives.push( ractive );
			changes[ ractive._guid ] = {};
		}

		changes[ ractive._guid ][ model.getKeypath() ] = model.get();
	}

	i = ractives.length;
	while ( i-- ) {
		let ractive = ractives[i];

		changeHook.fire( ractive, changes[ ractive._guid ] );
	}
}
