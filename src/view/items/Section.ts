import TemplateItemType from 'config/types';
import type { ModelWithRebound } from 'model/ModelBase';
import { keep } from 'shared/set';
import runloop from 'src/global/runloop';
import type { Ractive } from 'src/Ractive/RactiveDefinition';
import Context from 'src/shared/Context';
import { createDocumentFragment } from 'utils/dom';
import { isArray, isObject, isObjectLike, isUndefined } from 'utils/is';
import { keys } from 'utils/object';

import Fragment from '../Fragment';
import RepeatedFragment from '../RepeatedFragment';

import type { BindingFlagOwner } from './element/BindingFlag';
import type { DecoratorOwner } from './element/Decorator';
import type { TransitionOwner } from './element/Transition';
import type { EventDirectiveOwner } from './shared/EventDirective';
import type { ItemBasicInterface } from './shared/Item';
import { MustacheContainer, MustacheOpts } from './shared/Mustache';

function isEmpty(value: unknown): boolean {
  return (
    !value ||
    (isArray(value) && value.length === 0) ||
    (isObject(value) && keys(value).length === 0)
  );
}

function getType(value: unknown, hasIndexRef: unknown): TemplateItemType {
  if (hasIndexRef || isArray(value)) return TemplateItemType.SECTION_EACH;
  if (isObjectLike(value)) return TemplateItemType.SECTION_IF_WITH;
  if (isUndefined(value)) return null;
  return TemplateItemType.SECTION_IF;
}

interface SectionOpts extends MustacheOpts {
  template: Section['template'];
}

export default class Section
  extends MustacheContainer
  implements DecoratorOwner, TransitionOwner, EventDirectiveOwner, BindingFlagOwner {
  public isAlias: boolean;
  public sectionType: TemplateItemType;
  public templateSectionType: TemplateItemType;
  public subordinate: boolean;
  public sibling: this;
  public yield: Context;
  public detached: Fragment;
  public rendered: boolean;
  public container: Ractive;
  public nextSibling: this;

  constructor(options: SectionOpts) {
    super(options);

    this.isAlias = options.template.t === TemplateItemType.ALIAS;
    this.sectionType =
      options.template.n || (this.isAlias && TemplateItemType.SECTION_WITH) || null;
    this.templateSectionType = this.sectionType;
    this.subordinate = options.template.l === 1;
    this.fragment = null;
  }

  bind(): void {
    super.bind();

    if (this.subordinate) {
      this.sibling = <this>this.up.items[this.up.items.indexOf(<ItemBasicInterface>this) - 1];
      this.sibling.nextSibling = this;
    }

    // if we managed to bind, we need to create children
    if (this.model || this.isAlias) {
      this.dirty = true;
      this.update();
    } else if (
      this.sectionType &&
      this.sectionType === TemplateItemType.SECTION_UNLESS &&
      (!this.sibling || !this.sibling.isTruthy())
    ) {
      this.fragment = new Fragment({
        owner: this,
        template: this.template.f
      }).bind();
    }
  }

  bubble(): void {
    if (!this.dirty && this.yield) {
      this.dirty = true;
      this.containerFragment.bubble();
    } else super.bubble();
  }

  detach(): DocumentFragment | Element {
    const frag = this.fragment || this.detached;
    return frag ? frag.detach() : super.detach();
  }

  findNextNode() {
    return (this.containerFragment || this.up).findNextNode(this);
  }

  isTruthy(): boolean {
    if (this.subordinate && this.sibling.isTruthy()) return true;
    const value = !this.model ? undefined : this.model.isRoot ? this.model.value : this.model.get();
    return (
      !!value && (this.templateSectionType === TemplateItemType.SECTION_IF_WITH || !isEmpty(value))
    );
  }

  rebind(next, previous, safe): boolean {
    if (super.rebind(next, previous, safe)) {
      if (
        this.fragment &&
        this.sectionType !== TemplateItemType.SECTION_IF &&
        this.sectionType !== TemplateItemType.SECTION_UNLESS
      ) {
        this.fragment.rebind(next);
      }
    }
    return true;
  }

  rebound(update): void {
    if (this.model) {
      if ('rebound' in this.model) (<ModelWithRebound>this.model).rebound(update);
      else {
        super.unbind();
        super.bind();
        if (
          this.sectionType === TemplateItemType.SECTION_WITH ||
          this.sectionType === TemplateItemType.SECTION_IF_WITH ||
          this.sectionType === TemplateItemType.SECTION_EACH
        ) {
          if (this.fragment) this.fragment.rebind(this.model);
        }

        if (update) this.bubble();
      }
    }
    if (this.fragment) this.fragment.rebound(update);
  }

  render(target, occupants): void {
    this.rendered = true;
    if (this.fragment) this.fragment.render(target, occupants);
  }

  shuffle(newIndices): void {
    if (this.fragment && this.sectionType === TemplateItemType.SECTION_EACH) {
      this.fragment.shuffle(newIndices);
    }
  }

  unbind(view?): void {
    super.unbind();
    if (this.fragment) this.fragment.unbind(view);
  }

  unrender(shouldDestroy): void {
    if (this.rendered && this.fragment) this.fragment.unrender(shouldDestroy);
    this.rendered = false;
  }

  update(): void {
    if (!this.dirty) return;

    if (
      this.fragment &&
      this.sectionType !== TemplateItemType.SECTION_IF &&
      this.sectionType !== TemplateItemType.SECTION_UNLESS
    ) {
      this.fragment.context = this.model;
    }

    if (!this.model && this.sectionType !== TemplateItemType.SECTION_UNLESS && !this.isAlias)
      return;

    this.dirty = false;

    const value = !this.model ? undefined : this.model.isRoot ? this.model.value : this.model.get();
    const siblingFalsey = !this.subordinate || !this.sibling.isTruthy();
    const lastType = this.sectionType;

    if (this.yield && this.yield !== value) {
      this.up = this.containerFragment;
      this.container = null;
      this.yield = null;
      if (this.rendered) this.fragment.unbind().unrender(true);
      this.fragment = null;
    } else if (this.rendered && !this.yield && value instanceof Context) {
      if (this.rendered && this.fragment) this.fragment.unbind().unrender(true);
      this.fragment = null;
    }

    // watch for switching section types
    if (this.sectionType === null || this.templateSectionType === null)
      this.sectionType = getType(value, this.template.i);
    if (lastType && lastType !== this.sectionType && this.fragment) {
      if (this.rendered) {
        this.fragment.unbind().unrender(true);
      }

      this.fragment = null;
    }

    let newFragment;

    const fragmentShouldExist =
      this.sectionType === TemplateItemType.SECTION_EACH || // each always gets a fragment, which may have no iterations
      this.sectionType === TemplateItemType.SECTION_WITH || // with (partial context) always gets a fragment
      (siblingFalsey &&
        (this.sectionType === TemplateItemType.SECTION_UNLESS
          ? !this.isTruthy()
          : this.isTruthy())) || // if, unless, and if-with depend on siblings and the condition
      this.isAlias;

    if (fragmentShouldExist) {
      if (!this.fragment) this.fragment = this.detached;

      if (this.fragment) {
        // check for detached fragment
        if (this.detached) {
          attach(this, this.fragment);
          this.detached = null;
          this.rendered = true;
        }

        if (!this.fragment.bound) this.fragment.bind(this.model);
        this.fragment.update();
      } else {
        if (this.sectionType === TemplateItemType.SECTION_EACH) {
          newFragment = new RepeatedFragment({
            owner: this,
            template: this.template.f,
            indexRef: this.template.i
          }).bind(this.model);
        } else {
          // only with and if-with provide context - if and unless do not
          let context =
            this.sectionType !== TemplateItemType.SECTION_IF &&
            this.sectionType !== TemplateItemType.SECTION_UNLESS
              ? this.model
              : null;

          if (value instanceof Context) {
            this.yield = value;
            this.containerFragment = this.up;
            this.up = value.fragment;
            this.container = value.ractive;
            context = undefined;
          }

          newFragment = new Fragment({
            owner: this,
            template: this.template.f
          }).bind(context);
        }
      }
    } else {
      if (this.fragment && this.rendered) {
        if (keep !== true) {
          this.fragment.unbind().unrender(true);
        } else {
          this.unrender(false);
          this.detached = this.fragment;
          runloop.promise().then(() => {
            if (this.detached) this.detach();
          });
        }
      } else if (this.fragment) {
        this.fragment.unbind();
      }

      this.fragment = null;
    }

    if (newFragment) {
      if (this.rendered) {
        attach(this, newFragment);
      }

      this.fragment = newFragment;
    }

    if (this.nextSibling) {
      this.nextSibling.dirty = true;
      this.nextSibling.update();
    }
  }
}

function attach(section: Section, fragment: Fragment): void {
  const anchor = (section.containerFragment || section.up).findNextNode(section);

  if (anchor) {
    const docFrag = createDocumentFragment();
    fragment.render(docFrag);

    anchor.parentNode.insertBefore(docFrag, anchor);
  } else {
    fragment.render(section.up.findParentNode());
  }
}
