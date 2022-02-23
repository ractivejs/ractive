import { escapeKey, unescapeKey } from 'shared/keypaths';
import { addToArray, removeFromArray } from 'utils/array';
import { isArray, isObject, isObjectLike, isFunction } from 'utils/is';
import bind from 'utils/bind';
import { create, keys as objectKeys } from 'utils/object';

const shuffleTasks = { early: [], mark: [] };
const registerQueue = { early: [], mark: [] };
export const noVirtual = { virtual: false };

export default class ModelBase {
  constructor(parent) {
    this.deps = [];

    this.children = [];
    this.childByKey = {};
    this.links = [];

    this.bindings = [];

    if (parent) {
      this.parent = parent;
      this.root = parent.root;
    }
  }

  addShuffleTask(task, stage = 'early') {
    shuffleTasks[stage].push(task);
  }
  addShuffleRegister(item, stage = 'early') {
    registerQueue[stage].push({ model: this, item });
  }

  downstreamChanged() {}

  findMatches(keys) {
    const len = keys.length;

    let existingMatches = [this];
    let matches;
    let i;

    for (i = 0; i < len; i += 1) {
      const key = keys[i];

      if (key === '*') {
        matches = [];
        existingMatches.forEach(model => {
          matches.push.apply(matches, model.getValueChildren(model.get()));
        });
      } else {
        matches = existingMatches.map(model => model.joinKey(key));
      }

      existingMatches = matches;
    }

    return matches;
  }

  getKeypath(ractive) {
    if (ractive !== this.ractive && this._link) return this._link.target.getKeypath(ractive);

    if (!this.keypath) {
      const parent = this.parent && this.parent.getKeypath(ractive);
      this.keypath = parent
        ? `${this.parent.getKeypath(ractive)}.${escapeKey(this.key)}`
        : escapeKey(this.key);
    }

    return this.keypath;
  }

  getValueChildren(value) {
    let children;
    if (isArray(value)) {
      children = [];
      if ('length' in this && this.length !== value.length) {
        children.push(this.joinKey('length'));
      }
      value.forEach((m, i) => {
        children.push(this.joinKey(i));
      });
    } else if (isObject(value) || isFunction(value)) {
      children = objectKeys(value).map(key => this.joinKey(escapeKey(key)));
    } else if (value != null) {
      children = [];
    }

    const computed = this.computed;
    if (computed) {
      children.push.apply(children, objectKeys(computed).map(k => this.joinKey(k)));
    }

    return children;
  }

  getVirtual(shouldCapture) {
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
    } else return value;
  }

  has(key) {
    if (this._link) return this._link.has(key);

    const value = this.get(false, noVirtual);
    if (!value) return false;

    key = unescapeKey(key);
    if ((isFunction(value) || isObject(value)) && key in value) return true;

    let computed = this.computed;
    if (computed && key in this.computed) return true;

    computed = this.root.ractive && this.root.ractive.computed;
    if (computed) {
      objectKeys(computed).forEach(k => {
        if (computed[k].pattern && computed[k].pattern.test(this.getKeypath())) return true;
      });
    }

    return false;
  }

  joinAll(keys, opts) {
    let model = this;
    for (let i = 0; i < keys.length; i += 1) {
      if (
        opts &&
        opts.lastLink === false &&
        i + 1 === keys.length &&
        model.childByKey[keys[i]] &&
        model.childByKey[keys[i]]._link
      )
        return model.childByKey[keys[i]];
      model = model.joinKey(keys[i], opts);
    }

    return model;
  }

  notifyUpstream(startPath) {
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

  rebind(next, previous, safe) {
    if (this._link) {
      this._link.rebind(next, previous, false);
    }

    if (next === this) return;

    // tell the deps to move to the new target
    let i = this.deps.length;
    while (i--) {
      if (this.deps[i].rebind) this.deps[i].rebind(next, previous, safe);
    }

    i = this.links.length;
    while (i--) {
      const link = this.links[i];
      // only relink the root of the link tree
      if (link.owner && link.owner._link) link.relinking(next, safe);
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

  reference() {
    'refs' in this ? this.refs++ : (this.refs = 1);
  }

  register(dep) {
    this.deps.push(dep);
  }

  registerLink(link) {
    addToArray(this.links, link);
  }

  registerPatternObserver(observer) {
    (this.patterns || (this.patterns = [])).push(observer);
    this.register(observer);
  }

  registerTwowayBinding(binding) {
    this.bindings.push(binding);
  }

  unreference() {
    if ('refs' in this) this.refs--;
  }

  unregister(dep) {
    removeFromArray(this.deps, dep);
  }

  unregisterLink(link) {
    removeFromArray(this.links, link);
  }

  unregisterPatternObserver(observer) {
    removeFromArray(this.patterns, observer);
    this.unregister(observer);
  }

  unregisterTwowayBinding(binding) {
    removeFromArray(this.bindings, binding);
  }

  updateFromBindings(cascade) {
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
}

// TODO: this may be better handled by overriding `get` on models with a parent that isRoot
export function maybeBind(model, value, shouldBind) {
  if (shouldBind && isFunction(value) && model.parent && model.parent.isRoot) {
    if (!model.boundValue) {
      model.boundValue = bind(value._r_unbound || value, model.parent.ractive);
    }

    return model.boundValue;
  }

  return value;
}

function updateFromBindings(model) {
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

export function fireShuffleTasks(stage) {
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

export function shuffle(model, newIndices, link, unsafe) {
  model.shuffling = true;

  let upstream = model.source().length !== model.source().value.length;
  let i = newIndices.length;
  while (i--) {
    const idx = newIndices[i];
    // nothing is actually changing, so move in the index and roll on
    if (i === idx) {
      continue;
    }

    upstream = true;

    // rebind the children on i to idx
    if (i in model.childByKey)
      model.childByKey[i].rebind(
        !~idx ? undefined : model.joinKey(idx),
        model.childByKey[i],
        !unsafe
      );
  }

  model.links.forEach(l => l.shuffle(newIndices));
  if (!link) fireShuffleTasks('early');

  i = model.deps.length;
  while (i--) {
    if (model.deps[i].shuffle) model.deps[i].shuffle(newIndices);
  }

  model[link ? 'marked' : 'mark']();
  if (!link) fireShuffleTasks('mark');

  if (upstream) model.notifyUpstream();

  model.shuffling = false;
}

export function checkDataLink(model, value) {
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
