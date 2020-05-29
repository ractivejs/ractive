import { fromExpression } from './createFunction';
import { isArray, isObject } from 'utils/is';
import { keys } from 'utils/object';
import { ExpressionTempleteElement, TemplateDefinition } from 'parse/templateElements';

type ExpressionRegistry = {
  [key: string]: Function;
};

export default function insertExpressions(obj: TemplateDefinition, expr: ExpressionRegistry): void {
  keys(obj).forEach(key => {
    if (isExpression(key, obj)) return addTo(obj, expr);

    const ref = obj[key];
    if (hasChildren(ref)) insertExpressions(ref, expr);
  });
}

function isExpression(key: string, obj: any): obj is ExpressionTempleteElement {
  return key === 's' && isArray(obj.r);
}

function addTo(obj: ExpressionTempleteElement, expr: ExpressionRegistry): void {
  const { s, r } = obj;
  if (!expr[s]) expr[s] = fromExpression(s, r.length);
}

function hasChildren(ref: unknown): boolean {
  return isArray(ref) || isObject(ref);
}
