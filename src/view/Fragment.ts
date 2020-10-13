import TemplateItemType from 'config/types';
import type ModelBase from 'model/ModelBase';
import type { ModelWithRebound } from 'model/ModelBase';
import KeyModel from 'model/specials/KeyModel';
import type { AliasDefinitionRefinedTemplateItem } from 'parse/converters/mustache/mustacheDefinitions';
import { getContext, findParentWithContext } from 'shared/getRactiveContext';
import { shuffled, toEscapedString, toString } from 'shared/methodCallers';
import runloop from 'src/global/runloop';
import type { Ractive } from 'src/Ractive/RactiveDefinition';
import type { FindOpts } from 'types/MethodOptions';
import { findMap } from 'utils/array';
import { createDocumentFragment } from 'utils/dom';
import parseJSON from 'utils/parseJSON';

import processItems from './helpers/processItems';
import createItem from './items/createItem';
import type { ItemBasicInterface } from './items/shared/Item';
import resolve from './resolvers/resolve';

/**
 * todo refine dest values which can be
 * - KeyModel
 * - ReferenceExpressionProxy
 * - LinkModel
 * - Model
 * - ExpressionProxy
 */
type ViewAliases = { [key: string]: ModelBase | KeyModel };

function resolveAliases(
  aliases: AliasDefinitionRefinedTemplateItem[],
  fragment: Fragment,
  dest: ViewAliases = {}
): typeof dest {
  for (let i = 0; i < aliases.length; i++) {
    if (!dest[aliases[i].n]) {
      const m = resolve(fragment, aliases[i].x);
      dest[aliases[i].n] = m;
      m.reference();
    }
  }

  return dest;
}

export interface FragmentOpts {
  /** Element | Section | Partial | Attribute */
  owner: Fragment['owner'];
  ractive?: Fragment['ractive'];
  cssIds?: Fragment['cssIds'];
  template?: Fragment['template'];
}

export default class Fragment {
  /** The item that owns this fragment - an element, section, partial, or attribute */
  public owner: any;
  public isRoot: boolean;
  public parent: any;
  public ractive: Ractive;
  private template: any;

  public componentParent: Fragment;
  public context: ModelBase;
  public cssIds: string[];
  public isIteration: boolean;
  public iterations: any;
  public items: ItemBasicInterface[];
  public aliases: ViewAliases;
  public pathModel: KeyModel;
  public rootModel: KeyModel;
  public keyModel: KeyModel;
  public key: string | number;
  public index: number;
  public idxModel: KeyModel;
  public value: unknown;
  public lastValue: unknown;
  public shouldRebind: number;

  public delegate: any;
  public rendered: boolean;
  public dirty: boolean;
  private dirtyValue: boolean;
  public bound: boolean;
  private updating: boolean;

  public shuffle: Function;

  constructor(options: FragmentOpts) {
    this.owner = options.owner;

    this.isRoot = !options.owner.up;
    this.parent = this.isRoot ? null : this.owner.up;
    this.ractive = options.ractive || (this.isRoot ? options.owner : this.parent.ractive);

    this.componentParent = this.isRoot && this.ractive.component ? this.ractive.component.up : null;
    if (!this.isRoot || this.ractive.delegate) {
      this.delegate = this.owner.containerFragment
        ? this.owner.containerFragment && this.owner.containerFragment.delegate
        : (this.componentParent && this.componentParent.delegate) ||
          (this.parent && this.parent.delegate);
    } else {
      this.delegate = false;
    }

    this.context = null;
    this.rendered = false;

    // encapsulated styles should be inherited until they get applied by an element
    if ('cssIds' in options) {
      this.cssIds = options.cssIds && options.cssIds.length && options.cssIds;
    } else {
      this.cssIds = this.parent ? this.parent.cssIds : null;
    }

    this.dirty = false;
    this.dirtyValue = true; // used for attribute values

    this.template = options.template || [];
    this.createItems();
  }

  // LinkModel
  // ExpressionProxy
  // ReferenceExpressionProxy
  // ComputationChild
  // Model
  // RootModel
  bind(context?: ModelBase): this {
    this.context = context;

    if (this.owner.template.z) {
      this.aliases = resolveAliases(
        this.owner.template.z,
        this.owner.containerFragment || this.parent
      );
    }

    const len = this.items.length;
    for (let i = 0; i < len; i++) this.items[i].bind();
    this.bound = true;

    // in rare cases, a forced resolution (or similar) will cause the
    // fragment to be dirty before it's even finished binding. In those
    // cases we update immediately
    if (this.dirty) this.update();

    return this;
  }

  bubble(): void {
    this.dirtyValue = true;

    if (!this.dirty) {
      this.dirty = true;

      if (this.isRoot) {
        // TODO encapsulate 'is component root, but not overall root' check?
        if (this.ractive.component) {
          this.ractive.component.bubble();
        } else if (this.bound) {
          runloop.addFragment(this);
        }
      } else {
        this.owner.bubble(this.index);
      }
    }
  }

  createItems(): void {
    // this is a hot code path
    const max = this.template.length;
    this.items = [];

    // todo refine items type
    // 'Triple'
    // 'Attribute'
    // 'Textarea'
    // 'Option'
    // 'Select'
    // 'BindingFlag'
    // 'Section'
    // 'Interpolator'
    // 'Input'
    // 'Component'
    // 'Element'
    // 'Partial'
    // 'Text'
    for (let index = 0; index < max; index++) {
      this.items[index] = createItem({
        up: this,
        template: this.template[index],
        index
      });
    }
  }

  destroyed(): void {
    const len = this.items.length;
    for (let i = 0; i < len; i++) this.items[i].destroyed();
    if (this.pathModel) this.pathModel.destroyed();
    if (this.rootModel) this.rootModel.destroyed();
  }

  detach(): DocumentFragment {
    const docFrag = createDocumentFragment();
    const xs = this.items;
    const len = xs.length;
    for (let i = 0; i < len; i++) {
      docFrag.appendChild(xs[i].detach());
    }
    return docFrag;
  }

  find(selector: string, options?: FindOpts): HTMLElement {
    return findMap(this.items, i => i.find(selector, options));
  }

  findAll(selector: string, options: FindOpts & { result?: Element[] }): void {
    if (this.items) {
      this.items.forEach(i => i.findAll && i.findAll(selector, options));
    }
  }

  findComponent(name, options?) {
    return findMap(this.items, i => i.findComponent(name, options));
  }

  findAllComponents(name, options): void {
    if (this.items) {
      this.items.forEach(i => i.findAllComponents && i.findAllComponents(name, options));
    }
  }

  findContext() {
    const base = findParentWithContext(this);
    if (!base || !base.context) return this.ractive.viewmodel;
    else return base.context;
  }

  findNextNode(item?) {
    // search for the next node going forward
    if (item) {
      let it;
      for (let i = item.index + 1; i < this.items.length; i++) {
        it = this.items[i];
        if (!it || !it.firstNode) continue;

        const node = it.firstNode(true);
        if (node) return node;
      }
    }

    // if this is the root fragment, and there are no more items,
    // it means we're at the end...
    if (this.isRoot) {
      if (this.ractive.component) {
        return this.ractive.component.up.findNextNode(this.ractive.component);
      }

      // TODO possible edge case with other content
      // appended to this.ractive.el?
      return null;
    }

    if (this.parent) return this.owner.findNextNode(this); // the argument is in case the parent is a RepeatedFragment
  }

  findParentNode() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let fragment: Fragment = this;

    do {
      if (fragment.owner.type === TemplateItemType.ELEMENT) {
        return fragment.owner.node;
      }

      if (fragment.isRoot && !fragment.ractive.component) {
        // TODO encapsulate check
        return fragment.ractive.el;
      }

      if (fragment.owner.type === TemplateItemType.YIELDER) {
        fragment = fragment.owner.containerFragment;
      } else {
        fragment = fragment.componentParent || fragment.parent; // TODO ugh
      }
    } while (fragment);

    throw new Error('Could not find parent node'); // TODO link to issue tracker
  }

  firstNode(skipParent: boolean) {
    const node = findMap(this.items, i => i.firstNode(true));
    if (node) return node;
    if (skipParent) return null;

    return this.parent.findNextNode(this.owner);
  }

  getKey(): Fragment['keyModel'] {
    return this.keyModel || (this.keyModel = new KeyModel(this.key));
  }

  getIndex(): Fragment['idxModel'] {
    return this.idxModel || (this.idxModel = new KeyModel(this.index));
  }

  rebind(next: Fragment['context']): void {
    this.context = next;
    if (this.rootModel) this.rootModel.context = this.context;
    if (this.pathModel) this.pathModel.context = this.context;
  }

  rebound(update: boolean): void {
    if (this.owner.template.z) {
      const aliases = this.aliases;
      for (const k in aliases) {
        if ('rebound' in aliases[k]) {
          (aliases[k] as ModelWithRebound).rebound(update);
        } else {
          aliases[k].unreference();
          aliases[k] = null;
        }
      }

      resolveAliases(this.owner.template.z, this.owner.containerFragment || this.parent, aliases);
    }

    this.items.forEach(x => x.rebound(update));
    if (update) {
      if (this.rootModel) this.rootModel.applyValue(this.context.getKeypath(this.ractive.root));
      if (this.pathModel) this.pathModel.applyValue(this.context.getKeypath());
    }
  }

  render(target?, occupants?): void {
    if (this.rendered) throw new Error('Fragment is already rendered!');
    this.rendered = true;

    const xs = this.items;
    const len = xs.length;
    for (let i = 0; i < len; i++) {
      xs[i].render(target, occupants);
    }
  }

  resetTemplate(template): void {
    const wasBound = this.bound;
    const wasRendered = this.rendered;

    // TODO ensure transitions are disabled globally during reset

    if (wasBound) {
      if (wasRendered) this.unrender(true);
      this.unbind();
    }

    this.template = template;
    this.createItems();

    if (wasBound) {
      this.bind(this.context);

      if (wasRendered) {
        const parentNode = this.findParentNode();
        const anchor = this.findNextNode();

        if (anchor) {
          const docFrag = createDocumentFragment();
          this.render(docFrag);
          parentNode.insertBefore(docFrag, anchor);
        } else {
          this.render(parentNode);
        }
      }
    }
  }

  shuffled(): void {
    this.items.forEach(shuffled);
    if (this.rootModel) this.rootModel.applyValue(this.context.getKeypath(this.ractive.root));
    if (this.pathModel) this.pathModel.applyValue(this.context.getKeypath());
  }

  toString(escape?: boolean): string {
    return this.items.map(escape ? toEscapedString : toString).join('');
  }

  unbind(view?: boolean): this {
    if (this.owner.template.z && !this.owner.yielder) {
      for (const k in this.aliases) {
        this.aliases[k].unreference();
      }

      this.aliases = {};
    }

    this.context = null;
    const len = this.items.length;
    for (let i = 0; i < len; i++) this.items[i].unbind(view);
    this.bound = false;

    return this;
  }

  unrender(shouldDestroy?: boolean): void {
    const len = this.items.length;
    for (let i = 0; i < len; i++) this.items[i].unrender(shouldDestroy);
    this.rendered = false;
  }

  update(): void {
    if (this.dirty) {
      if (!this.updating) {
        this.dirty = false;
        this.updating = true;
        const len = this.items.length;
        for (let i = 0; i < len; i++) this.items[i].update();
        this.updating = false;
      } else if (this.isRoot) {
        runloop.addFragmentToRoot(this);
      }
    }
  }

  valueOf(): unknown {
    if (this.items.length === 1) {
      return this.items[0].valueOf();
    }

    if (this.dirtyValue) {
      const values = {};
      const source = processItems(this.items, values, this.ractive._guid);
      const parsed = parseJSON(source, values);

      this.value = parsed ? parsed.value : this.toString();

      this.dirtyValue = false;
    }

    return this.value;
  }

  getContext = getContext;
  getKeypath = getKeypath;
}

export function getKeypath(this: Fragment, root?: boolean): KeyModel {
  const base = findParentWithContext(this);
  let model: KeyModel;
  if (root) {
    if (!this.rootModel) {
      this.rootModel = new KeyModel(
        this.context.getKeypath(this.ractive.root),
        this.context,
        this.ractive.root
      );
      model = this.rootModel;
    } else return this.rootModel;
  } else {
    if (!this.pathModel) {
      this.pathModel = new KeyModel(this.context.getKeypath(), this.context);
      model = this.pathModel;
    } else return this.pathModel;
  }

  if (base && base.context) base.getKeypath(root).registerChild(model);

  return model;
}

export function isFragment(item: unknown): item is Fragment {
  return item instanceof Fragment;
}
