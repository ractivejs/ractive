import { fireShuffleTasks } from 'src/model/ModelBase';
import { REFERENCE } from 'config/types';
import { rebindMatch } from 'shared/rebind';
import { isString } from 'utils/is';
import { escapeKey } from 'shared/keypaths';
import ExpressionProxy from './ExpressionProxy';
import resolveReference from './resolveReference';
import resolve from './resolve';

import LinkModel, { Missing } from 'src/model/LinkModel';

export default class ReferenceExpressionProxy extends LinkModel {
  constructor(fragment, template) {
    super(null, null, null, '@undefined');
    this.root = fragment.ractive.viewmodel;
    this.template = template;
    this.rootLink = true;

    let base = resolve(fragment, template);
    let idx;

    const proxy = (this.proxy = {
      rebind: (next, previous) => {
        if (previous === base) {
          next = rebindMatch(template, next, previous);
          if (next !== base) {
            base = next;
          }
        } else if (~(idx = members.indexOf(previous))) {
          next = rebindMatch(template.m[idx].n, next, previous);
          if (next !== members[idx]) {
            members.splice(idx, 1, next || Missing);
          }
        }

        if (next !== previous) previous.unregister(proxy);
        if (next) next.addShuffleTask(() => next.register(proxy));
      },
      handleChange: () => {
        pathChanged();
      }
    });

    base.register(proxy);

    const members = template.m.map(tpl => {
      if (isString(tpl)) {
        return { get: () => tpl };
      }

      let model;

      if (tpl.t === REFERENCE) {
        model = resolveReference(fragment, tpl.n);
        model.register(proxy);

        return model;
      }

      model = new ExpressionProxy(fragment, tpl);
      model.register(proxy);
      return model;
    });

    const pathChanged = () => {
      const keys = members.map(m => escapeKey(String(m.get())));
      const model = base.joinAll(keys);

      if (model !== this.model) {
        this.model = model;
        this.relinking(model);
        fireShuffleTasks();
        refreshPathDeps(this);
      }
    };

    pathChanged();
  }

  getKeypath() {
    return this.model ? this.model.getKeypath() : '@undefined';
  }
}

function refreshPathDeps(proxy) {
  let len = proxy.deps.length;
  let i, v;

  for (i = 0; i < len; i++) {
    v = proxy.deps[i];
    if (v.pathChanged) v.pathChanged();
    if (v.fragment && v.fragment.pathModel) v.fragment.pathModel.applyValue(proxy.getKeypath());
  }

  len = proxy.children.length;
  for (i = 0; i < len; i++) {
    refreshPathDeps(proxy.children[i]);
  }
}
