import fireEvent from './fireEvent';
import getRactiveContext from '../shared/getRactiveContext';

export class Hook {
  constructor(event) {
    this.event = event;
    this.method = 'on' + event;
  }

  fire(ractive, arg) {
    const context = getRactiveContext(ractive);
    const method = this.method;

    if (ractive[method]) {
      arg ? ractive[method](context, arg) : ractive[method](context);
    }

    fireEvent(ractive, this.event, context, arg ? [arg, ractive] : [ractive]);
  }
}

function getChildQueue(queue, ractive) {
  return queue[ractive._guid] || (queue[ractive._guid] = []);
}

function fire(hookQueue, ractive) {
  const childQueue = getChildQueue(hookQueue.queue, ractive);

  hookQueue.hook.fire(ractive);

  // queue is "live" because components can end up being
  // added while hooks fire on parents that modify data values.
  while (childQueue.length) {
    fire(hookQueue, childQueue.shift());
  }

  delete hookQueue.queue[ractive._guid];
}

export class HookQueue {
  constructor(event) {
    this.hook = new Hook(event);
    this.inProcess = {};
    this.queue = {};
  }

  begin(ractive) {
    this.inProcess[ractive._guid] = true;
  }

  end(ractive) {
    const parent = ractive.parent;

    // If this is *isn't* a child of a component that's in process,
    // it should call methods or fire at this point
    if (!parent || !this.inProcess[parent._guid]) {
      fire(this, ractive);
    } else {
      // elsewise, handoff to parent to fire when ready
      getChildQueue(this.queue, parent).push(ractive);
    }

    delete this.inProcess[ractive._guid];
  }
}

const hooks = {};
[
  'construct',
  'config',
  'attachchild',
  'detach',
  'detachchild',
  'insert',
  'complete',
  'reset',
  'render',
  'unrendering',
  'unrender',
  'teardown',
  'destruct',
  'update'
].forEach(hook => {
  hooks[hook] = new Hook(hook);
});
hooks.init = new HookQueue('init');

export default hooks;
