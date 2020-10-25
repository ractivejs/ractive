import type { Ractive } from 'src/Ractive/RactiveDefinition';

import getRactiveContext from '../shared/getRactiveContext';

import fireEvent from './fireEvent';

export class Hook {
  private event: string;
  private method: string;

  constructor(event: Hook['event']) {
    this.event = event;
    this.method = 'on' + event;
  }

  fire(ractive: Ractive, arg?: unknown): void {
    const context = getRactiveContext(ractive);
    const method = this.method;

    if (ractive[method]) {
      arg ? ractive[method](context, arg) : ractive[method](context);
    }

    fireEvent(ractive, this.event, context, arg ? [arg, ractive] : [ractive]);
  }
}

function getChildQueue(queue: HookQueue['queue'], ractive: Ractive): Ractive[] {
  return queue[ractive._guid] || (queue[ractive._guid] = []);
}

function fire(hookQueue: HookQueue, ractive: Ractive): void {
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
  public hook: Hook;
  public inProcess: Record<string, boolean>;
  public queue: Record<string, Ractive[]>;

  constructor(event: Hook['event']) {
    this.hook = new Hook(event);
    this.inProcess = {};
    this.queue = {};
  }

  begin(ractive: Ractive): void {
    this.inProcess[ractive._guid] = true;
  }

  end(ractive: Ractive): void {
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

interface Hooks {
  [key: string]: Hook;
}
type HooksWithInit = Hooks & {
  init?: HookQueue;
};

const hooks: HooksWithInit = {};
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
