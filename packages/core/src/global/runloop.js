import { addToArray } from '../utils/array';
import TransitionManager from './TransitionManager';

let batch;

const runloop = {
	start ( instance ) {
		let fulfilPromise;
		const promise = new Promise( f => ( fulfilPromise = f ) );

		batch = {
			previousBatch: batch,
			transitionManager: new TransitionManager( fulfilPromise, batch && batch.transitionManager ),
			fragments: [],
			tasks: [],
			immediateObservers: [],
			deferredObservers: [],
			instance,
			promise
		};

		return promise;
	},

	end () {
		flushChanges();

		if ( !batch.previousBatch ) batch.transitionManager.start();

		batch = batch.previousBatch;
	},

	addFragment ( fragment ) {
		addToArray( batch.fragments, fragment );
	},

	// TODO: come up with a better way to handle fragments that trigger their own update
	addFragmentToRoot ( fragment ) {
		if ( !batch ) return;

		let b = batch;
		while ( b.previousBatch ) {
			b = b.previousBatch;
		}

		addToArray( b.fragments, fragment );
	},

	addObserver ( observer, defer ) {
		if ( !batch ) {
			observer.dispatch();
		} else {
			addToArray( defer ? batch.deferredObservers : batch.immediateObservers, observer );
		}
	},

	registerTransition ( transition ) {
		transition._manager = batch.transitionManager;
		batch.transitionManager.add( transition );
	},

	// synchronise node detachments with transition ends
	detachWhenReady ( thing ) {
		batch.transitionManager.detachQueue.push( thing );
	},

	scheduleTask ( task, postRender ) {
		let _batch;

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
	},

	promise () {
		if ( !batch ) return Promise.resolve();

		let target = batch;
		while ( target.previousBatch ) {
			target = target.previousBatch;
		}

		return target.promise || Promise.resolve();
	}
};

export default runloop;

function dispatch ( observer ) {
	observer.dispatch();
}

function flushChanges () {
	let which = batch.immediateObservers;
	batch.immediateObservers = [];
	which.forEach( dispatch );

	// Now that changes have been fully propagated, we can update the DOM
	// and complete other tasks
	let i = batch.fragments.length;
	let fragment;

	which = batch.fragments;
	batch.fragments = [];

	while ( i-- ) {
		fragment = which[i];
		fragment.update();
	}

	batch.transitionManager.ready();

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
	if ( batch.fragments.length || batch.immediateObservers.length || batch.deferredObservers.length || batch.tasks.length ) return flushChanges();
}
