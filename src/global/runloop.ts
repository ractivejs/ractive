import type { InternalObserver } from 'src/Ractive/prototype/observe';
import { addToArray } from 'utils/array';
import type Fragment from 'view/Fragment';
import type Transition from 'view/items/element/Transition';

import TransitionManager from './TransitionManager';

interface Batch {
  previousBatch: Batch;
  transitionManager: TransitionManager;
  fragments: Fragment[];
  tasks: Function[];
  immediateObservers: InternalObserver[];
  deferredObservers: InternalObserver[];
  promise: Promise<void>;
}

export let batch: Batch;

class Runloop {
  private static instance: Runloop;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): Runloop {
    if (!Runloop.instance) {
      Runloop.instance = new Runloop();
    }

    return Runloop.instance;
  }

  public active(): boolean {
    return !!batch;
  }

  public start(): Promise<void> {
    let fulfilPromise: Function;
    const promise = new Promise<void>(f => (fulfilPromise = f));

    batch = {
      previousBatch: batch,
      transitionManager: new TransitionManager(fulfilPromise, batch && batch.transitionManager),
      fragments: [],
      tasks: [],
      immediateObservers: [],
      deferredObservers: [],
      promise
    };

    return promise;
  }

  public end(): void {
    flushChanges();

    if (!batch.previousBatch) batch.transitionManager.start();
    else batch.transitionManager.checkStart();

    batch = batch.previousBatch;
  }

  public addFragment(fragment: Fragment): void {
    addToArray(batch.fragments, fragment);
  }

  // TODO: come up with a better way to handle fragments that trigger their own update
  public addFragmentToRoot(fragment: Fragment): void {
    if (!batch) return;

    let b = batch;
    while (b.previousBatch) {
      b = b.previousBatch;
    }

    addToArray(b.fragments, fragment);
  }

  public addObserver(observer: InternalObserver, defer: boolean): void {
    if (!batch) {
      observer.dispatch();
    } else {
      addToArray(defer ? batch.deferredObservers : batch.immediateObservers, observer);
    }
  }

  public registerTransition(transition: Transition): void {
    transition._manager = batch.transitionManager;
    batch.transitionManager.add(transition);
  }

  // synchronise node detachments with transition ends
  public detachWhenReady(thing): void {
    batch.transitionManager.detachQueue.push(thing);
  }

  public scheduleTask(task: Function, postRender?: boolean): void {
    let _batch: Batch;

    if (!batch) {
      task();
    } else {
      _batch = batch;
      while (postRender && _batch.previousBatch) {
        // this can't happen until the DOM has been fully updated
        // otherwise in some situations (with components inside elements)
        // transitions and decorators will initialise prematurely
        _batch = _batch.previousBatch;
      }

      _batch.tasks.push(task);
    }
  }

  public promise(): Promise<void> {
    if (!batch) return Promise.resolve();

    let target = batch;
    while (target.previousBatch) {
      target = target.previousBatch;
    }

    return target.promise || Promise.resolve();
  }
}

export default Runloop.getInstance();

function dispatch(observer: InternalObserver): void {
  observer.dispatch();
}

function flushChanges(): void {
  const which = batch.immediateObservers;
  batch.immediateObservers = [];
  which.forEach(dispatch);

  // Now that changes have been fully propagated, we can update the DOM
  // and complete other tasks
  let i = batch.fragments.length;
  let fragment: Fragment;

  const fragments = batch.fragments;
  batch.fragments = [];

  while (i--) {
    fragment = fragments[i];
    fragment.update();
  }

  batch.transitionManager.ready();

  const deferredObservers = batch.deferredObservers;
  batch.deferredObservers = [];
  deferredObservers.forEach(dispatch);

  const tasks = batch.tasks;
  batch.tasks = [];

  for (let i = 0; i < tasks.length; i += 1) {
    tasks[i]();
  }

  // If updating the view caused some model blowback - e.g. a triple
  // containing <option> elements caused the binding on the <select>
  // to update - then we start over
  if (
    batch.fragments.length ||
    batch.immediateObservers.length ||
    batch.deferredObservers.length ||
    batch.tasks.length
  ) {
    return flushChanges();
  }
}
