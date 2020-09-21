import TemplateItemType from 'config/types';
import type {
  GenericAttributeTemplateItem,
  GenericAttributeTemplateValue
} from 'parse/converters/element/elementDefinitions';
import { splitKeypath } from 'shared/keypaths';
import type { Filter } from 'types/utils';
import { isArray, isObjectType, isString, isUndefined } from 'utils/is';
import { warnIfDebug } from 'utils/log';

import runloop from '../../../global/runloop';
import parseJSON from '../../../utils/parseJSON';
import Fragment from '../../Fragment';
import resolve from '../../resolvers/resolve';
import type Component from '../Component';
import type Section from '../Section';
import findElement from '../shared/findElement';
import Item, { ItemOpts } from '../shared/Item';

interface MappingOpts extends ItemOpts {
  owner?: Mapping['owner'];
  element: Mapping['element'];
  /** @override */
  template: Mapping['template'];
}

type MappingValue = Filter<GenericAttributeTemplateValue, Array<unknown>>;

export default class Mapping extends Item {
  public name: string;
  public owner: Section | Component;
  public element: Component;
  public value: MappingValue;
  public boundFragment: Fragment;
  public link: any;
  /** @override */
  public template: GenericAttributeTemplateItem & { f: MappingValue };

  constructor(options: MappingOpts) {
    super(options);

    this.name = options.template.n;

    this.owner = options.owner || options.up.owner || options.element || findElement(options.up);
    this.element =
      options.element || ('attributeByName' in this.owner ? this.owner : findElement(options.up));
    this.up = this.element.up; // shared
    this.ractive = this.up.ractive;

    this.element.attributeByName[this.name] = this;

    this.value = options.template.f;
  }

  bind(): void {
    const template = this.template.f;
    const viewmodel = this.element.instance.viewmodel;

    if (template === 0) {
      // empty attributes are `true`
      viewmodel.joinKey(this.name).set(true);
    } else if (isString(template)) {
      const parsed = parseJSON(template);
      viewmodel.joinKey(this.name).set(parsed ? parsed.value : template);
    } else if (isArray(template)) {
      createMapping(this);
    }
  }

  rebound(update): void {
    if (this.boundFragment) this.boundFragment.rebound(update);
    if (this.link) {
      this.model = resolve(this.up, this.template.f[0]);
      const model = this.element.instance.viewmodel.joinAll(splitKeypath(this.name));
      model.link(this.model, this.name, { mapping: true });
    }
  }

  render(): void {}

  unbind(view): void {
    if (this.model) this.model.unregister(this);
    if (this.boundFragment) this.boundFragment.unbind(view);

    if (this.element.bound) {
      if (this.link.target === this.model) this.link.owner.unlink();
    }
  }

  unrender(): void {}

  update(): void {
    if (this.dirty) {
      this.dirty = false;
      if (this.boundFragment) this.boundFragment.update();
    }
  }
}

function createMapping(item: Mapping): void {
  const template = item.template.f;
  const viewmodel = item.element.instance.viewmodel;
  const childData = viewmodel.value;

  if (
    isArray(template) &&
    template.length === 1 &&
    typeof template[0] !== 'string' &&
    template[0].t === TemplateItemType.INTERPOLATOR
  ) {
    const model = resolve(item.up, template[0]);
    const val = model.get(false);

    // if the interpolator is not static
    if (!template[0].s) {
      item.model = model;
      item.link = viewmodel.createLink(item.name, model, template[0].r, {
        mapping: true
      });

      // initialize parent side of the mapping from child data
      if (isUndefined(val) && !model.isReadonly && item.name in childData) {
        model.set(childData[item.name]);
      }
    } else if (!isObjectType(val) || template[0].x) {
      // copy non-object, non-computed vals through
      viewmodel.joinKey(splitKeypath(item.name)).set(val);
    } else {
      // warn about trying to copy an object
      warnIfDebug(`Cannot copy non-computed object value from static mapping '${item.name}'`);
    }

    // TSRChange - remove unregister invocation since it has no param an at least 1 param is needed
    // if the item isn't going to manage the model, give it a change to tear down if it's computed
    // if (model !== item.model) model.unregister();
  } else {
    item.boundFragment = new Fragment({
      owner: item,
      template
    }).bind();

    item.model = viewmodel.joinKey(splitKeypath(item.name));
    item.model.set(item.boundFragment.valueOf());

    // item is a *bit* of a hack
    item.boundFragment.bubble = () => {
      Fragment.prototype.bubble.call(item.boundFragment);
      // defer this to avoid mucking around model deps if there happens to be an expression involved
      runloop.scheduleTask(() => {
        item.boundFragment.update();
        item.model.set(item.boundFragment.valueOf());
      });
    };
  }
}
