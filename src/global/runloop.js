import Hook from '../events/Hook';
import { addToArray, removeFromArray } from '../utils/array';
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

		// TODO: this is a temporary hack that needs to go away with a probably breaking change
		if ( batch ) batch.children++;

		batch = {
			previousBatch: batch,
			transitionManager: new TransitionManager( fulfilPromise, batch && batch.transitionManager ),
			fragments: [],
			tasks: [],
			immediateObservers: [],
			deferredObservers: [],
			ractives: [],
			instance: instance,
			children: 0
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

	addInstance ( instance ) {
		if ( batch ) addToArray( batch.ractives, instance );
	},

	addObserver ( observer, defer ) {
		addToArray( defer ? batch.deferredObservers : batch.immediateObservers, observer );
	},

	children () { return batch.children; },

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
	let which = batch.immediateObservers;
	batch.immediateObservers = [];
	which.forEach( dispatch );

	// Now that changes have been fully propagated, we can update the DOM
	// and complete other tasks
	let i = batch.fragments.length;
	let fragment;

	which = batch.fragments;
	batch.fragments = [];
	const ractives = batch.ractives;
	batch.ractives = [];

	while ( i-- ) {
		fragment = which[i];

		// TODO deprecate this. It's annoying and serves no useful function
		const ractive = fragment.ractive;
		changeHook.fire( ractive, ractive.viewmodel.changes );
		ractive.viewmodel.changes = {};
		removeFromArray( ractives, ractive );

		fragment.update();
	}

	i = ractives.length;
	while ( i-- ) {
		const ractive = ractives[i];
		changeHook.fire( ractive, ractive.viewmodel.changes );
		ractive.viewmodel.changes = {};
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
	if ( batch.fragments.length || batch.immediateObservers.length || batch.deferredObservers.length || batch.ractives.length ) return flushChanges();
}
