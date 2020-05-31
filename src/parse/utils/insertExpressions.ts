import { fromExpression } from './createFunction';
import { isArray, isObject } from 'utils/is';
import { keys } from 'utils/object';
import { ExpressionFunctionTemplateItem } from 'parse/converters/templateItemDefinitions';

type ExpressionRegistry = {
  [key: string]: Function;
};

// todo set obj correct type
export default function insertExpressions(obj, expr: ExpressionRegistry): void {
  keys(obj).forEach(key => {
    if (isExpression(key, obj)) return addTo(obj, expr);

    const ref = obj[key];
    if (hasChildren(ref)) insertExpressions(ref, expr);
  });
}

function isExpression(key: string, obj: any): obj is ExpressionFunctionTemplateItem {
  return key === 's' && isArray(obj.r);
}

function addTo(obj: ExpressionFunctionTemplateItem, expr: ExpressionRegistry): void {
  const { s, r } = obj;
  if (!expr[s]) expr[s] = fromExpression(s, r.length);
}

function hasChildren(ref: unknown): boolean {
  return isArray(ref) || isObject(ref);
}
