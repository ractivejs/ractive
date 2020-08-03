import ModelBase from 'model/ModelBase';
import {
  EventDirectiveTemplateItem,
  TransitionDirectiveTemplateItem
} from 'parse/converters/element/elementDefinitions';
import { ExpressionFunctionTemplateItem } from 'parse/converters/templateItemDefinitions';
import getFunction from 'shared/getFunction';
import Fragment from 'view/Fragment';
import ExpressionProxy from 'view/resolvers/ExpressionProxy';

import resolveReference from '../../resolvers/resolveReference';
import Decorator from '../element/Decorator';
import Transition from '../element/Transition';

import EventDirective from './EventDirective';

export function setupArgsFn(
  item: EventDirective,
  template: EventDirectiveTemplateItem,
  fragment?: Fragment,
  opts: { register?: boolean } = {}
): void {
  if (template?.f && typeof template?.f !== 'string') {
    if (opts.register) {
      item.model = new ExpressionProxy(fragment, template.f);
      item.model.register(item);
    } else {
      item.fn = getFunction(template.f.s, template.f.r.length);
    }
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
): (SpecialReference | ModelBase)[];
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
