import ModelBase from 'model/ModelBase';
import { ExpressionRefinementTemplateItem } from 'parse/converters/expressions/expressionDefinitions';
import RepeatedFragment from 'view/RepeatedFragment';

import Fragment from '../Fragment';

import ExpressionProxy from './ExpressionProxy';
import ReferenceExpressionProxy from './ReferenceExpressionProxy';
import resolveReference from './resolveReference';

export default function resolve(
  fragment: Fragment | RepeatedFragment,
  template: ExpressionRefinementTemplateItem
): ExpressionProxy | ReferenceExpressionProxy | ModelBase {
  if (template.r) {
    return resolveReference(fragment, template.r);
  } else if (template.x) {
    return new ExpressionProxy(fragment, template.x);
  } else if (template.rx) {
    return new ReferenceExpressionProxy(fragment, template.rx);
  }
}
