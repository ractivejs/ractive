import ModelBase from 'model/ModelBase';
import {
  EventDirectiveTemplateItem,
  TransitionDirectiveTemplateItem,
  DecoratorDirectiveTemplateItem
} from 'parse/converters/element/elementDefinitions';
import { ExpressionFunctionTemplateItem } from 'parse/converters/templateItemDefinitions';
import getFunction from 'shared/getFunction';
import Fragment from 'view/Fragment';
import ExpressionProxy from 'view/resolvers/ExpressionProxy';

import resolveReference from '../../resolvers/resolveReference';
import Decorator from '../element/Decorator';
import Transition from '../element/Transition';

import EventDirective from './EventDirective';

export function setupArgsFn(item: Transition, template: TransitionDirectiveTemplateItem): void;
export function setupArgsFn(item: EventDirective, template: EventDirectiveTemplateItem): void;
export function setupArgsFn(
  item: EventDirective | Transition,
  template: EventDirectiveTemplateItem | TransitionDirectiveTemplateItem
): void {
  if (template?.f && typeof template?.f !== 'string') {
    item.fn = getFunction(template.f.s, template.f.r.length);
  }
}

// TSRChange - these function body was part of `setupArgsFn` using additional paramter.
export function setupArgsFnWithRegister(
  item: Decorator,
  template: DecoratorDirectiveTemplateItem,
  fragment: Fragment
): void {
  if (template?.f && typeof template?.f !== 'string') {
    item.model = new ExpressionProxy(fragment, template.f);
    item.model.register(item);
  }
}

export interface SpecialReference {
  special: string;
  keys: Array<string | number>;
}

export type SpecialReferenceFunction = (ref: string) => SpecialReference;

export function resolveArgs(
  item: Transition,
  template: TransitionDirectiveTemplateItem,
  fragment: Fragment
): ModelBase[];
export function resolveArgs(
  item: EventDirective,
  template: EventDirectiveTemplateItem,
  fragment: Fragment,
  opts: { specialRef?: SpecialReferenceFunction }
): (SpecialReference | ModelBase)[];
export function resolveArgs(
  _item: EventDirective | Transition,
  template: EventDirectiveTemplateItem | TransitionDirectiveTemplateItem,
  fragment: Fragment,
  opts: { specialRef?: SpecialReferenceFunction } = {}
): (SpecialReference | ModelBase)[] {
  const references = ((template.f as unknown) as ExpressionFunctionTemplateItem).r;
  return references.map((ref: string) => {
    let model: SpecialReference | ModelBase;

    if (opts.specialRef && (model = opts.specialRef(ref))) {
      return model;
    }

    model = resolveReference(fragment, ref);

    return model;
  });
}

export function teardownArgsFn(item: Decorator): void {
  if (item.model) item.model.unregister(item);
}
