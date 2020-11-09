import {
  ALIAS,
  SECTION_EACH,
  SECTION_IF,
  SECTION_IF_WITH,
  SECTION_UNLESS,
  SECTION_WITH
} from 'config/types';
import { createDocumentFragment } from 'utils/dom';
import { isArray, isObject, isObjectLike, isUndefined } from 'utils/is';
import { keep } from 'shared/set';
import runloop from 'src/global/runloop';
import Fragment from '../Fragment';
import RepeatedFragment from '../RepeatedFragment';
import { MustacheContainer } from './shared/Mustache';
import { keys } from 'utils/object';
import Context from 'src/shared/Context';

function isEmpty(value) {
  return (
    !value ||
    (isArray(value) && value.length === 0) ||
    (isObject(value) && keys(value).length === 0)
  );
}

function getType(value, hasIndexRef) {
  if (hasIndexRef || isArray(value)) return SECTION_EACH;
  if (isObjectLike(value)) return SECTION_IF_WITH;
  if (isUndefined(value)) return null;
  return SECTION_IF;
}

export default class Section extends MustacheContainer {
  constructor(options) {
    super(options);

    this.isAlias = options.template.t === ALIAS;
    this.sectionType = options.template.n || (this.isAlias && SECTION_WITH) || null;
    this.templateSectionType = this.sectionType;
    this.subordinate = options.template.l === 1;
    this.fragment = null;
  }

  bind() {
    super.bind();

    if (this.subordinate) {
      this.sibling = this.up.items[this.up.items.indexOf(this) - 1];
      this.sibling.nextSibling = this;
    }

    // if we managed to bind, we need to create children
    if (this.model || this.isAlias) {
      this.dirty = true;
      this.update();
    } else if (
      this.sectionType &&
      this.sectionType === SECTION_UNLESS &&
      (!this.sibling || !this.sibling.isTruthy())
    ) {
      this.fragment = new Fragment({
        owner: this,
        template: this.template.f
      }).bind();
    }
  }

  bubble() {
    if (!this.dirty && this.yield) {
      this.dirty = true;
      this.containerFragment.bubble();
    } else super.bubble();
  }

  detach() {
    const frag = this.fragment || this.detached;
    return frag ? frag.detach() : super.detach();
  }

  findNextNode() {
    return (this.containerFragment || this.up).findNextNode(this);
  }

  isTruthy() {
    if (this.subordinate && this.sibling.isTruthy()) return true;
    const value = !this.model ? undefined : this.model.isRoot ? this.model.value : this.model.get();
    return !!value && (this.templateSectionType === SECTION_IF_WITH || !isEmpty(value));
  }

  rebind(next, previous, safe) {
    if (super.rebind(next, previous, safe)) {
      if (this.fragment && this.sectionType !== SECTION_IF && this.sectionType !== SECTION_UNLESS) {
        this.fragment.rebind(next);
      }
    }
  }

  rebound(update) {
    if (this.model) {
      if (this.model.rebound) this.model.rebound(update);
      else {
        super.unbind();
        super.bind();
        if (
          this.sectionType === SECTION_WITH ||
          this.sectionType === SECTION_IF_WITH ||
          this.sectionType === SECTION_EACH
        ) {
          if (this.fragment) this.fragment.rebind(this.model);
        }

        if (update) this.bubble();
      }
    }
    if (this.fragment) this.fragment.rebound(update);
  }

  render(target, occupants) {
    this.rendered = true;
    if (this.fragment) this.fragment.render(target, occupants);
  }

  shuffle(newIndices) {
    if (this.fragment && this.sectionType === SECTION_EACH) {
      this.fragment.shuffle(newIndices);
    }
  }

  unbind(view) {
    super.unbind(view);
    if (this.fragment) this.fragment.unbind(view);
  }

  unrender(shouldDestroy) {
    if (this.rendered && this.fragment) this.fragment.unrender(shouldDestroy);
    this.rendered = false;
  }

  update() {
    if (!this.dirty) return;

    if (this.fragment && this.sectionType !== SECTION_IF && this.sectionType !== SECTION_UNLESS) {
      this.fragment.context = this.model;
    }

    if (!this.model && this.sectionType !== SECTION_UNLESS && !this.isAlias) return;

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
      this.sectionType === SECTION_EACH || // each always gets a fragment, which may have no iterations
      this.sectionType === SECTION_WITH || // with (partial context) always gets a fragment
      (siblingFalsey &&
        (this.sectionType === SECTION_UNLESS ? !this.isTruthy() : this.isTruthy())) || // if, unless, and if-with depend on siblings and the condition
      this.isAlias;

    if (fragmentShouldExist) {
      if (!this.fragment) this.fragment = this.detached;

      if (this.fragment) {
        // check for detached fragment
        if (this.detached) {
          attach(this, this.fragment);
          this.detached = false;
          this.rendered = true;
        }

        if (!this.fragment.bound) this.fragment.bind(this.model);
        this.fragment.update();
      } else {
        if (this.sectionType === SECTION_EACH) {
          newFragment = new RepeatedFragment({
            owner: this,
            template: this.template.f,
            indexRef: this.template.i
          }).bind(this.model);
        } else {
          // only with and if-with provide context - if and unless do not
          let context =
            this.sectionType !== SECTION_IF && this.sectionType !== SECTION_UNLESS
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

function attach(section, fragment) {
  const anchor = (section.containerFragment || section.up).findNextNode(section);

  if (anchor) {
    const docFrag = createDocumentFragment();
    fragment.render(docFrag);

    anchor.parentNode.insertBefore(docFrag, anchor);
  } else {
    fragment.render(section.up.findParentNode());
  }
}
