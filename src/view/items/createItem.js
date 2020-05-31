import {
  ALIAS,
  ANCHOR,
  AWAIT,
  COMMENT,
  COMPONENT,
  DOCTYPE,
  ELEMENT,
  INTERPOLATOR,
  PARTIAL,
  SECTION,
  TRIPLE,
  YIELDER
} from 'config/types';
import { ATTRIBUTE, BINDING_FLAG, DECORATOR, EVENT, TRANSITION } from 'config/types';
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

const constructors = {};
constructors[ALIAS] = Section;
constructors[ANCHOR] = Component;
constructors[AWAIT] = Await;
constructors[DOCTYPE] = Doctype;
constructors[INTERPOLATOR] = Interpolator;
constructors[PARTIAL] = Partial;
constructors[SECTION] = Section;
constructors[TRIPLE] = Triple;
constructors[YIELDER] = Partial;

constructors[ATTRIBUTE] = Attribute;
constructors[BINDING_FLAG] = BindingFlag;
constructors[DECORATOR] = Decorator;
constructors[EVENT] = EventDirective;
constructors[TRANSITION] = Transition;
constructors[COMMENT] = Comment;

const specialElements = {
  doctype: Doctype,
  form: Form,
  input: Input,
  option: Option,
  select: Select,
  textarea: Textarea
};

export default function createItem(options) {
  if (isString(options.template)) {
    return new Text(options);
  }

  let ctor;
  let name;
  const type = options.template.t;

  if (type === ELEMENT) {
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

  let Item;

  // component mappings are a special case of attribute
  if (type === ATTRIBUTE) {
    let el = options.owner;
    if (!el || (el.type !== ANCHOR && el.type !== COMPONENT && el.type !== ELEMENT)) {
      el = findElement(options.up);
    }
    options.element = el;

    Item = el.type === COMPONENT || el.type === ANCHOR ? Mapping : Attribute;
  } else {
    Item = constructors[type];
  }

  if (!Item) throw new Error(`Unrecognised item type ${type}`);

  return new Item(options);
}
