import { removeFromArray } from 'utils/array';
import { isFunction } from 'utils/is';
import Transition from 'view/items/element/Transition';

let id = 0;

export default class TransitionManager {
  public callback: Function;
  public parent: TransitionManager;

  public intros: Transition[];
  public outros: Transition[];
  public children: TransitionManager[];

  public totalChildren = 0;
  public outroChildren = 0;

  public detachQueue: any[];
  public outrosComplete = false;

  public id: number;

  public started: boolean;

  public notifiedTotal: boolean;

  constructor(callback: TransitionManager['callback'], parent: TransitionManager['parent']) {
    this.intros = [];
    this.outros = [];
    this.children = [];
    this.detachQueue = [];

    this.callback = callback;
    this.parent = parent;

    this.id = id++;

    if (parent) {
      parent.addChild(this);
    }
  }

  add(transition: Transition): void {
    const list = transition.isIntro ? this.intros : this.outros;
    transition.starting = true;
    list.push(transition);
  }

  addChild(child: TransitionManager): void {
    this.children.push(child);

    this.totalChildren += 1;
    this.outroChildren += 1;
  }

  checkStart(): void {
    if (this.parent && this.parent.started) this.start();
  }

  decrementOutros(): void {
    this.outroChildren -= 1;
    check(this);
  }

  decrementTotal(): void {
    this.totalChildren -= 1;
    check(this);
  }

  detachNodes(): void {
    let len = this.detachQueue.length;
    for (let i = 0; i < len; i++) this.detachQueue[i].detach();
    len = this.children.length;
    for (let i = 0; i < len; i++) this.children[i].detachNodes();
    this.detachQueue = [];
  }

  ready(): void {
    if (this.detachQueue.length) detachImmediate(this);
  }

  remove(transition: Transition): void {
    const list = transition.isIntro ? this.intros : this.outros;
    removeFromArray(list, transition);
    check(this);
  }

  start(): void {
    this.started = true;
    this.children.forEach(c => c.start());
    this.intros.concat(this.outros).forEach(t => t.start());
    check(this);
  }
}

function check(tm: TransitionManager): void {
  if (!tm.started || tm.outros.length || tm.outroChildren) return;

  // If all outros are complete, and we haven't already done this,
  // we notify the parent if there is one, otherwise
  // start detaching nodes
  if (!tm.outrosComplete) {
    tm.outrosComplete = true;

    if (tm.parent) tm.parent.decrementOutros();

    if (allOutrosComplete(tm)) {
      tm.detachNodes();
    }
  }

  // Once everything is done, we can notify parent transition
  // manager and call the callback
  if (!tm.intros.length && !tm.totalChildren) {
    if (isFunction(tm.callback)) {
      tm.callback();
    }

    if (tm.parent && !tm.notifiedTotal) {
      tm.notifiedTotal = true;
      tm.parent.decrementTotal();
    }
  }
}

function allOutrosComplete(manager: TransitionManager): boolean {
  return !manager || (manager.outrosComplete && allOutrosComplete(manager.parent));
}

// check through the detach queue to see if a node is up or downstream from a
// transition and if not, go ahead and detach it
function detachImmediate(manager: TransitionManager): void {
  const queue = manager.detachQueue;
  const outros = collectAllOutros(manager);

  if (!outros.length) {
    manager.detachNodes();
  } else {
    let i = queue.length;
    let j = 0;
    let node, trans;
    const nqueue = (manager.detachQueue = []);

    start: while (i--) {
      node = queue[i].node;
      j = outros.length;
      while (j--) {
        trans = outros[j].element.node;
        // check to see if the node is, contains, or is contained by the transitioning node
        if (trans === node || trans.contains(node) || node.contains(trans)) {
          nqueue.push(queue[i]);
          continue start;
        }
      }

      // no match, we can drop it
      queue[i].detach();
    }
  }
}

function collectAllOutros(manager: TransitionManager, _list?: Transition[]): Transition[] {
  let list = _list;

  // if there's no list, we're starting at the root to build one
  if (!list) {
    list = [];
    let parent = manager;
    while (parent.parent) parent = parent.parent;
    return collectAllOutros(parent, list);
  } else {
    // grab all outros from child managers
    let i = manager.children.length;
    while (i--) {
      list = collectAllOutros(manager.children[i], list);
    }

    // grab any from this manager if there are any
    if (manager.outros.length) list = list.concat(manager.outros);

    return list;
  }
}
