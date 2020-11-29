import TemplateItemType from 'config/types';
import LinkModel, { Missing } from 'model/LinkModel';
import type Model from 'model/Model';
import ModelBase, { fireShuffleTasks, ModelDependency, ModelWithRebound } from 'model/ModelBase';
import type {
  ReferenceExpressionTemplateItem,
  ReferenceTemplateItem
} from 'parse/converters/expressions/expressionDefinitions';
import type { ExpressionFunctionTemplateItem } from 'parse/converters/templateItemDefinitions';
import { escapeKey } from 'shared/keypaths';
import { rebindMatch } from 'shared/rebind';
import type { Keypath } from 'types/Generic';
import { isArray, isString } from 'utils/is';
import type Fragment from 'view/Fragment';
import type RepeatedFragment from 'view/RepeatedFragment';

import ExpressionProxy from './ExpressionProxy';
import resolve from './resolve';
import resolveReference from './resolveReference';

export default class ReferenceExpressionProxy extends LinkModel implements ModelWithRebound {
  private fragment: Fragment | RepeatedFragment;
  private model: Model | LinkModel;
  private template: ReferenceExpressionTemplateItem;
  public base: ModelBase;
  private proxy: { rebind: Function; handleChange: () => void };
  public members: ModelBase[];

  constructor(
    fragment: ReferenceExpressionProxy['fragment'],
    template: ReferenceExpressionProxy['template']
  ) {
    super(null, null, null, '@undefined');
    this.root = fragment.ractive.viewmodel;
    this.template = template;
    this.rootLink = true;
    this.template = template;
    this.fragment = fragment;

    this.rebound();
  }

  getKeypath(): Keypath {
    return this.model ? this.model.getKeypath() : '@undefined';
  }

  rebound(): void {
    const fragment = this.fragment;
    const template = this.template;

    let base = (this.base = resolve(fragment, template));
    let idx: number;

    if (this.proxy) {
      teardown(this);
    }

    const proxy = (this.proxy = {
      rebind: (next, previous) => {
        if (previous === base) {
          next = rebindMatch(template, next, previous);
          if (next !== base) {
            this.base = base = next;
          }
        } else if (~(idx = members.indexOf(previous))) {
          const referenceTemplateItem = template.m[idx] as ReferenceTemplateItem;
          next = rebindMatch(referenceTemplateItem.n, next, previous);
          if (next !== members[idx]) {
            members.splice(idx, 1, next || Missing);
          }
        }

        if (next !== previous) {
          previous.unregister(proxy);
          if (next) next.addShuffleTask(() => next.register(proxy));
        }
      },
      handleChange: () => {
        pathChanged();
      }
    });

    base.register(proxy);

    const members = (this.members = template.m.map(tpl => {
      if (isString(tpl)) {
        return { get: () => tpl };
      }

      let model;

      if ('t' in tpl && tpl.t === TemplateItemType.REFERENCE) {
        model = resolveReference(fragment, tpl.n);

        model.register(proxy);

        return model;
      }

      model = new ExpressionProxy(fragment, tpl as ExpressionFunctionTemplateItem);
      model.register(proxy);
      return model;
    }));

    const pathChanged = (): void => {
      const model = base && <LinkModel | Model>base.joinAll(
          members.reduce((list, m) => {
            const k = m.get();
            if (isArray(k)) return list.concat(k);
            else list.push(escapeKey(String(k)));
            return list;
          }, [])
        );

      if (model !== this.model) {
        this.model = model;
        this.relinking(model);
        fireShuffleTasks();
        refreshPathDeps(this);
        this.fragment.shuffled();
      }
    };

    pathChanged();
  }

  teardown(): void {
    teardown(this);
    super.teardown();
  }

  unreference(): void {
    super.unreference();
    if (!this.deps.length && !this.refs) this.teardown();
  }

  unregister(dep: ModelDependency): void {
    super.unregister(dep);
    if (!this.deps.length && !this.refs) this.teardown();
  }

  unregisterLink = ExpressionProxy.prototype.unregisterLink;
}

// TSRChange - move below function inside class body
// TSRChange - unreference & unregister are already present in body removed override
// const eproto = ExpressionProxy.prototype;
// const proto = ReferenceExpressionProxy.prototype;

// proto.unreference = eproto.unreference;
// proto.unregister = eproto.unregister;
// proto.unregisterLink = eproto.unregisterLink;

function teardown(proxy): void {
  if (proxy.base) proxy.base.unregister(proxy.proxy);
  if (proxy.models) {
    proxy.models.forEach(m => {
      if (m.unregister) m.unregister(proxy);
    });
  }
}

function refreshPathDeps(proxy: ReferenceExpressionProxy | LinkModel): void {
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
