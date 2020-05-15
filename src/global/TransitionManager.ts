import { removeFromArray } from 'utils/array';
import { isFunction } from 'utils/is';

let id = 0;

export default class TransitionManager {
  private callback: Function;
  private parent: TransitionManager;

  private intros = [];
  private outros = [];
  private children = [];

  private totalChildren = 0;
  private outroChildren = 0;

  public detachQueue = [];
  private outrosComplete = false;

  id: number;

  private started: boolean;

  private notifiedTotal: boolean;

  constructor(callback: Function, parent: TransitionManager) {
    this.callback = callback;
    this.parent = parent;

    this.id = id++;

    if (parent) {
      parent.addChild(this);
    }
  }

  public add(transition): void {
    const list = transition.isIntro ? this.intros : this.outros;
    transition.starting = true;
    list.push(transition);
  }

  public addChild(child: TransitionManager): void {
    this.children.push(child);

    this.totalChildren += 1;
    this.outroChildren += 1;
  }

  public checkStart(): void {
    if (this.parent && this.parent.started) this.start();
  }

  private decrementOutros(): void {
    this.outroChildren -= 1;
    this.check();
  }

  private decrementTotal(): void {
    this.totalChildren -= 1;
    this.check();
  }

  private detachNodes(): void {
    let len = this.detachQueue.length;
    for (let i = 0; i < len; i++) this.detachQueue[i].detach();
    len = this.children.length;
    for (let i = 0; i < len; i++) this.children[i].detachNodes();
    this.detachQueue = [];
  }

  public ready(): void {
    if (this.detachQueue.length) this.detachImmediate();
  }

  public remove(transition): void {
    const list = transition.isIntro ? this.intros : this.outros;
    removeFromArray(list, transition);
    this.check();
  }

  public start(): void {
    this.started = true;
    this.children.forEach(c => c.start());
    this.intros.concat(this.outros).forEach(t => t.start());
    this.check();
  }

  private check(): void {
    if (!this.started || this.outros.length || this.outroChildren) return;

    // If all outros are complete, and we haven't already done this,
    // we notify the parent if there is one, otherwise
    // start detaching nodes
    if (!this.outrosComplete) {
      this.outrosComplete = true;

      if (this.parent) this.parent.decrementOutros();

      if (TransitionManager.allOutrosComplete(this)) {
        this.detachNodes();
      }
    }

    // Once everything is done, we can notify parent transition
    // manager and call the callback
    if (!this.intros.length && !this.totalChildren) {
      if (isFunction(this.callback)) {
        this.callback();
      }

      if (this.parent && !this.notifiedTotal) {
        this.notifiedTotal = true;
        this.parent.decrementTotal();
      }
    }
  }

  // check through the detach queue to see if a node is up or downstream from a
  // transition and if not, go ahead and detach it
  private detachImmediate(): void {
    const queue = this.detachQueue;
    const outros = TransitionManager.collectAllOutros(this);

    if (!outros.length) {
      this.detachNodes();
    } else {
      let i = queue.length;
      let j = 0;
      let node, trans;
      const nqueue = (this.detachQueue = []);

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

  private static allOutrosComplete(manager: TransitionManager): boolean {
    return (
      !manager || (manager.outrosComplete && TransitionManager.allOutrosComplete(manager.parent))
    );
  }

  private static collectAllOutros(manager: TransitionManager, _list?): any[] {
    let list = _list;

    // if there's no list, we're starting at the root to build one
    if (!list) {
      list = [];
      let parent = manager;
      while (parent.parent) parent = parent.parent;
      return TransitionManager.collectAllOutros(parent, list);
    } else {
      // grab all outros from child managers
      let i = manager.children.length;
      while (i--) {
        list = TransitionManager.collectAllOutros(manager.children[i], list);
      }

      // grab any from this manager if there are any
      if (manager.outros.length) list = list.concat(manager.outros);

      return list;
    }
  }
}
