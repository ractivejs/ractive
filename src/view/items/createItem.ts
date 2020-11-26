import TemplateItemType from 'config/types';
import { findInstance } from 'shared/registry';
import { isString, isFunction } from 'utils/is';

import asyncProxy from './asyncProxy';
import Await from './Await';
import Comment from './Comment';
import Component from './Component';
import getComponentConstructor from './component/getComponentConstructor';
import Mapping from './component/Mapping';
import Doctype from './Doctype';
import Element from './Element';
import Attribute from './element/Attribute';
import BindingFlag from './element/BindingFlag';
import Decorator from './element/Decorator';
import Form from './element/specials/Form';
import Input from './element/specials/Input';
import Option from './element/specials/Option';
import Select from './element/specials/Select';
import Textarea from './element/specials/Textarea';
import Transition from './element/Transition';
import Interpolator from './Interpolator';
import Partial from './Partial';
import Section from './Section';
import EventDirective from './shared/EventDirective';
import findElement from './shared/findElement';
import Text from './Text';
import Triple from './Triple';

const constructors = {
  [TemplateItemType.ALIAS]: Section,
  [TemplateItemType.ANCHOR]: Component,
  [TemplateItemType.AWAIT]: Await,
  [TemplateItemType.DOCTYPE]: Doctype,
  [TemplateItemType.INTERPOLATOR]: Interpolator,
  [TemplateItemType.PARTIAL]: Partial,
  [TemplateItemType.SECTION]: Section,
  [TemplateItemType.TRIPLE]: Triple,
  [TemplateItemType.YIELDER]: Partial,

  [TemplateItemType.ATTRIBUTE]: Attribute,
  [TemplateItemType.BINDING_FLAG]: BindingFlag,
  [TemplateItemType.DECORATOR]: Decorator,
  [TemplateItemType.EVENT]: EventDirective,
  [TemplateItemType.TRANSITION]: Transition,
  [TemplateItemType.COMMENT]: Comment
};

const specialElements = {
  doctype: Doctype,
  form: Form,
  input: Input,
  option: Option,
  select: Select,
  textarea: Textarea
};

// TODO refine types
function createItem(options): any {
  if (isString(options.template)) {
    return new Text(options);
  }

  let ctor;
  let name: string;
  const type = options.template.t;

  if (type === TemplateItemType.ELEMENT) {
    name = options.template.e;

    // could be a macro partial
    ctor = findInstance('partials', options.up.ractive, name);
    if (ctor) {
      ctor = ctor.partials[name];
      if (ctor.styleSet) {
        options.macro = ctor;
        return new Partial(options);
      }
    }

    // could be component or element
    ctor = getComponentConstructor(options.up.ractive, name);
    if (ctor) {
      if (isFunction(ctor.then)) {
        return asyncProxy(ctor, options);
      } else if (isFunction(ctor)) {
        return new Component(options, ctor);
      }
    }

    ctor = specialElements[name.toLowerCase()] || Element;
    return new ctor(options);
  }

  let ItemConstructor;

  // component mappings are a special case of attribute
  if (type === TemplateItemType.ATTRIBUTE) {
    let el = options.owner;
    if (
      !el ||
      (el.type !== TemplateItemType.ANCHOR &&
        el.type !== TemplateItemType.COMPONENT &&
        el.type !== TemplateItemType.ELEMENT)
    ) {
      el = findElement(options.up);
    }
    options.element = el;

    ItemConstructor =
      el.type === TemplateItemType.COMPONENT || el.type === TemplateItemType.ANCHOR
        ? Mapping
        : Attribute;
  } else {
    ItemConstructor = constructors[type];
  }

  if (!ItemConstructor) throw new Error(`Unrecognised item type ${type}`);

  return new ItemConstructor(options);
}

export default createItem;
