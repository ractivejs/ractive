import type ModelBase from 'model/ModelBase';
import type { ExpressionRefinementTemplateItem } from 'parse/converters/expressions/expressionDefinitions';
import type RepeatedFragment from 'view/RepeatedFragment';

import type Fragment from '../Fragment';

import ExpressionProxy from './ExpressionProxy';
import ReferenceExpressionProxy from './ReferenceExpressionProxy';
import resolveReference from './resolveReference';

export default function resolve(
  fragment: Fragment | RepeatedFragment,
  template: ExpressionRefinementTemplateItem
): ModelBase {
  if (template.r) {
    return resolveReference(fragment, template.r);
  } else if (template.x) {
    return new ExpressionProxy(fragment, template.x);
  } else if (template.rx) {
    return new ReferenceExpressionProxy(fragment, template.rx);
  }
}
