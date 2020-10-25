import { escapeKey, unescapeKey } from 'shared/keypaths';
import type { Ractive } from 'src/Ractive/RactiveDefinition';
import type { Keypath } from 'types/Generic';
import { addToArray, removeFromArray, Indexes } from 'utils/array';
import bind from 'utils/bind';
import { isArray, isObject, isObjectLike, isFunction } from 'utils/is';
import { create, keys as objectKeys } from 'utils/object';

import type Computation from './Computation';
import LinkModel from './LinkModel';
import type Model from './Model';
import type RootModel from './RootModel';
import type RactiveModel from './specials/RactiveModel';

interface ShuffleTaskRegistry<T> {
  early: T[];
  mark: T[];
}

const shuffleTasks: ShuffleTaskRegistry<Function> = { early: [], mark: [] };
const registerQueue: ShuffleTaskRegistry<{ model: ModelBase; item: any }> = { early: [], mark: [] };

export const noVirtual = { virtual: false };

type ShuffleFunction = (newIndices: Indexes, unsafe?: boolean) => void;

export type ModelRebindFunction<T extends ModelBase> = (prev: T, next: T, safe?: boolean) => void;

/**
 * TODO Implement this interface in the following classes
 * - Triple
 * - PatternObserver
 * - Decorator
 * - Observer
 * - Section
 * - ExpressionProxy
 * - Interpolator
 */
export interface ModelDependency {
  handleChange?(path?: unknown): void;
  rebind?: ModelRebindFunction<ModelBase>;
  shuffle?: ShuffleFunction;
}

/** When adding a pattern to the model is also tracked as a dependency */
export interface ModelPattern extends ModelDependency {
  notify: (path: string[]) => void;
}

export interface ModelBinding {
  rebind: ModelRebindFunction<ModelBase>;
  getValue: Function;
}

// Options >>
export interface ModelGetOpts {
  virtual?: boolean;
  unwrap?: boolean;
  shouldBind?: boolean;
}

export interface ModelJoinOpts {
  lastLink?: boolean;
}

export interface ModelLinkOpts {
  implicit?: boolean;
  mapping?: boolean;
}
// Options <<

// TODO add correct types
export default abstract class ModelBase {
  public parent: ModelBase;
  public root: RootModel | RactiveModel;

  public ractive: Ractive;

  public deps: ModelDependency[];

  public children: ModelBase[];
  public childByKey: { [key: string]: any };

  public links: LinkModel[];

  public bindings: ModelBinding[];

  public _link: LinkModel;

  public keypath: Keypath;
  public key: string;

  public length: number;
  public refs: number;

  public computed: Record<string, Computation>;

  public dataModel: any;

  public patterns: ModelPattern[];

  public value: any;

  public abstract isReadonly: boolean;

  public isRoot: boolean;
  public isComputed: boolean;

  /**
   * isModel a LinkModel?
   * Maybe this can be replaced with `instanceof LinkModel` check
   */
  public isLink: boolean;

  constructor(parent: ModelBase) {
    this.deps = [];

    this.children = [];
    this.childByKey = {};

    this.links = [];
    this.bindings = [];

    this.patterns = [];

    if (parent) {
      this.parent = parent;
      this.root = parent.root;
    }
  }

  abstract get(shouldCapture?: boolean, opts?: ModelGetOpts);
  abstract set(value: unknown): void;

  abstract joinKey(key: string | number, opts?: ModelJoinOpts): ModelBase;

  retrieve(): any {}

  addShuffleTask(task: Function, stage = 'early'): void {
    shuffleTasks[stage].push(task);
  }
  addShuffleRegister(item, stage = 'early'): void {
    registerQueue[stage].push({ model: this, item });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  downstreamChanged(_path: string[], _depth?: number): void {}

  findMatches(keys: string[]): this[] {
    const len = keys.length;

    let existingMatches = [this];
    let matches;

    for (let i = 0; i < len; i += 1) {
      const key = keys[i];

      if (key === '*') {
        matches = [];
        existingMatches.forEach(model => {
          matches.push(...model.getValueChildren(model.get()));
        });
      } else {
        matches = existingMatches.map(model => model.joinKey(key));
      }

      existingMatches = matches;
    }

    return matches;
  }

  getKeypath(ractive?: Ractive): Keypath {
    if (ractive !== this.ractive && this._link) return this._link.target.getKeypath(ractive);

    if (!this.keypath) {
      const parent = this.parent && this.parent.getKeypath(ractive);
      this.keypath = parent
        ? `${this.parent.getKeypath(ractive)}.${escapeKey(this.key)}`
        : escapeKey(this.key);
    }

    return this.keypath;
  }

  getValueChildren(value: unknown) {
    let children;

    if (isArray(value)) {
      children = [];
      if ('length' in this && this.length !== value.length) {
        children.push(this.joinKey('length'));
      }
      value.forEach((_m, i) => {
        children.push(this.joinKey(i));
      });
    } else if (isObject(value) || isFunction(value)) {
      children = objectKeys(value).map(key => this.joinKey(escapeKey(key)));
    } else if (value != null) {
      children = [];
    }

    const computed = this.computed;
    if (computed) {
      children.push(...objectKeys(computed).map(k => this.joinKey(k)));
    }

    return children;
  }

  getVirtual(shouldCapture?: boolean) {
    const value = this.get(shouldCapture, { virtual: false });
    if (isObjectLike(value)) {
      const result = isArray(value) ? [] : create(null);

      let keys = objectKeys(value);
      let i = keys.length;
      while (i--) {
        const child = this.childByKey[keys[i]];
        if (!child) result[keys[i]] = value[keys[i]];
        else if (child._link) result[keys[i]] = child._link.getVirtual();
        else result[keys[i]] = child.getVirtual();
      }

      i = this.children.length;
      while (i--) {
        const child = this.children[i];
        if (!(child.key in result) && child._link) {
          result[child.key] = child._link.getVirtual();
        }
      }

      if (this.computed) {
        keys = objectKeys(this.computed);
        i = keys.length;
        while (i--) {
          result[keys[i]] = this.computed[keys[i]].get();
        }
      }

      return result;
    }

    return value;
  }

  has(key: string): boolean {
    if (this._link) return this._link.has(key);

    const value = this.get(false, noVirtual);
    if (!value) return false;

    key = unescapeKey(key);
    if ((isFunction(value) || isObject(value)) && key in value) return true;

    let computed = this.computed;
    if (computed && key in this.computed) return true;

    computed = this.root.ractive?.computed;
    if (computed) {
      objectKeys(computed).forEach(k => {
        if (computed[k].pattern && computed[k].pattern.test(this.getKeypath())) return true;
      });
    }

    return false;
  }

  joinAll<T extends ModelBase>(keys: (string | number)[], opts?: ModelJoinOpts): T {
    // add any to avoid warning on below reassign. Maybe we can find a more clean solution?
    let model: any = this; // eslint-disable-line @typescript-eslint/no-this-alias
    for (let i = 0; i < keys.length; i += 1) {
      if (opts?.lastLink === false && i + 1 === keys.length && this.childByKey[keys[i]]?._link) {
        return model.childByKey[keys[i]];
      }
      model = model.joinKey(keys[i], opts);
    }

    return model;
  }

  notifyUpstream(startPath?: string[]): void {
    let parent = this.parent;
    const path = startPath || [this.key];
    while (parent) {
      if (parent.patterns) parent.patterns.forEach(o => o.notify(path.slice()));
      path.unshift(parent.key);
      parent.links.forEach(l => l.notifiedUpstream(path, this.root));
      parent.deps.forEach(d => d.handleChange(path));
      parent.downstreamChanged(startPath);
      parent = parent.parent;
    }
  }

  rebind(next: ModelBase, previous: ModelBase, safe?: boolean): void {
    if (this._link) {
      this._link.rebind(next, previous, false);
    }

    if (next === this) return;

    // tell the deps to move to the new target
    let i = this.deps.length;
    while (i--) {
      const dep = this.deps[i];
      if ('rebind' in dep && typeof dep.rebind === 'function') dep.rebind(next, previous, safe);
    }

    i = this.links.length;
    while (i--) {
      const link: LinkModel = this.links[i] as LinkModel;
      // only relink the root of the link tree
      if (link.owner?._link) {
        link.relinking(next, safe);
      }
    }

    i = this.children.length;
    while (i--) {
      const child = this.children[i];
      child.rebind(next ? next.joinKey(child.key) : undefined, child._link || child, safe);
      if (this.dataModel) {
        this.addShuffleTask(() => checkDataLink(this, this.retrieve()), 'early');
      }
    }

    i = this.bindings.length;
    while (i--) {
      this.bindings[i].rebind(next, previous, safe);
    }
  }

  reference(): void {
    const hasRefs = 'refs' in this;
    hasRefs ? this.refs++ : (this.refs = 1);
  }

  register(dep: ModelDependency): void {
    this.deps.push(dep);
  }

  registerLink(link: LinkModel): void {
    addToArray(this.links, link);
  }

  registerPatternObserver(observer: ModelPattern): void {
    this.patterns.push(observer);
    this.register(observer);
  }

  registerTwowayBinding(binding: ModelBinding): void {
    this.bindings.push(binding);
  }

  unreference(): void {
    if ('refs' in this) this.refs--;
  }

  unregister(dep): void {
    removeFromArray(this.deps, dep);
  }

  unregisterLink(link: LinkModel): void {
    removeFromArray(this.links, link);
  }

  unregisterPatternObserver(observer: ModelPattern): void {
    removeFromArray(this.patterns, observer);
    this.unregister(observer);
  }

  unregisterTwowayBinding(binding: ModelBinding): void {
    removeFromArray(this.bindings, binding);
  }

  updateFromBindings(cascade: boolean): void {
    let i = this.bindings.length;
    while (i--) {
      const value = this.bindings[i].getValue();
      if (value !== this.value) this.set(value);
    }

    // check for one-way bindings if there are no two-ways
    if (!this.bindings.length) {
      const oneway = findBoundValue(this.deps);
      if (oneway && oneway.value !== this.value) this.set(oneway.value);
    }

    if (cascade) {
      this.children.forEach(updateFromBindings);
      this.links.forEach(updateFromBindings);
      if (this._link) this._link.updateFromBindings(cascade);
    }
  }

  link(model: Model | LinkModel, keypath?: Keypath, options?: ModelLinkOpts): LinkModel {
    const lnk = this._link || new LinkModel(this.parent, this, model, this.key);
    lnk.implicit = options?.implicit;
    lnk.mapping = options?.mapping;
    lnk.sourcePath = keypath;
    lnk.rootLink = true;
    if (this._link) this._link.relinking(model, false);
    this.rebind(lnk, this, false);
    fireShuffleTasks();

    this._link = lnk;
    lnk.markedAll();

    this.notifyUpstream();
    return lnk;
  }

  unlink(): void {
    if (this._link) {
      const ln = this._link;
      this._link = undefined;
      ln.rebind(this, ln, false);
      fireShuffleTasks();
      ln.teardown();
      this.notifyUpstream();
    }
  }
}

/**
 * The following interface can be applied to:
 * - ReferenceExpressionProxy
 */
export interface ModelWithRebound extends ModelBase {
  rebound: Function;
}

// TODO: this may be better handled by overriding `get` on models with a parent that isRoot
export function maybeBind(model, value, shouldBind: boolean) {
  if (shouldBind && isFunction(value) && model.parent && model.parent.isRoot) {
    if (!model.boundValue) {
      model.boundValue = bind(value._r_unbound || value, model.parent.ractive);
    }

    return model.boundValue;
  }

  return value;
}

function updateFromBindings(model: ModelBase): void {
  model.updateFromBindings(true);
}

export function findBoundValue(list) {
  let i = list.length;
  while (i--) {
    if (list[i].bound) {
      const owner = list[i].owner;
      if (owner) {
        const value = owner.name === 'checked' ? owner.node.checked : owner.node.value;
        return { value };
      }
    }
  }
}

export function fireShuffleTasks(stage?: keyof ShuffleTaskRegistry<unknown>): void {
  if (!stage) {
    fireShuffleTasks('early');
    fireShuffleTasks('mark');
  } else {
    const tasks = shuffleTasks[stage];
    shuffleTasks[stage] = [];
    let i = tasks.length;
    while (i--) tasks[i]();

    const register = registerQueue[stage];
    registerQueue[stage] = [];
    i = register.length;
    while (i--) register[i].model.register(register[i].item);
  }
}

export interface ModelWithShuffle extends ModelBase {
  shuffling: boolean;
  source: Function;
  shuffle: ShuffleFunction;
  mark: (force?: boolean) => void;
  marked?: () => void;
}

export function shuffle(
  model: ModelWithShuffle,
  newIndices: Indexes,
  link: boolean,
  unsafe?: boolean
): void {
  model.shuffling = true;

  let i = newIndices.length;
  while (i--) {
    const idx = newIndices[i];
    // nothing is actually changing, so move in the index and roll on
    if (i === idx) {
      continue;
    }

    // rebind the children on i to idx
    if (i in model.childByKey)
      model.childByKey[i].rebind(
        !~idx ? undefined : model.joinKey(idx),
        model.childByKey[i],
        !unsafe
      );
  }

  const upstream = model.source().length !== model.source().value.length;

  model.links.forEach(l => l.shuffle(newIndices));
  if (!link) fireShuffleTasks('early');

  i = model.deps.length;
  while (i--) {
    // TSRChange - `model.deps[i].shuffle === 'function'` -> was `model.deps[i].shuffle`
    if (typeof model.deps[i].shuffle === 'function') model.deps[i].shuffle(newIndices);
  }

  model[link ? 'marked' : 'mark']();
  if (!link) fireShuffleTasks('mark');

  if (upstream) model.notifyUpstream();

  model.shuffling = false;
}

export function checkDataLink(model: ModelBase, value): void {
  if (value !== model.dataModel) {
    if (value && value.viewmodel && value.viewmodel.isRoot && model.childByKey.data) {
      model.childByKey.data.link(value.viewmodel, 'data');
      model.dataModel = value;
    } else if (model.dataModel) {
      model.childByKey.data.unlink();
      model.dataModel = true;
    }
  }
}
