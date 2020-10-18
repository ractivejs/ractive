import type { ExpressionFunctionTemplateItem } from 'parse/converters/templateItemDefinitions';
import { isArray, isObject } from 'utils/is';
import { keys } from 'utils/object';

import { fromExpression } from './createFunction';

export type ExpressionRegistry = Record<string, Function>;

/**
 * @param obj Template definition with expressions
 */
export default function insertExpressions(
  obj: unknown[] | Record<string, unknown>,
  expr: ExpressionRegistry
): void {
  keys(obj).forEach(key => {
    if (isExpression(key, obj)) return addTo(obj, expr);

    const ref = obj[key];
    if (hasChildren(ref)) insertExpressions(ref, expr);
  });
}

function isExpression(key: string, obj: unknown): obj is ExpressionFunctionTemplateItem {
  return key === 's' && isArray(obj['r']);
}

function addTo(obj: ExpressionFunctionTemplateItem, expr: ExpressionRegistry): void {
  const { s, r } = obj;
  if (!expr[s]) expr[s] = fromExpression(s, r.length);
}

function hasChildren(ref: unknown): boolean {
  return isArray(ref) || isObject(ref);
}
