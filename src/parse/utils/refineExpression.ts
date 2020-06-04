import TemplateItemType from 'config/types';
import {
  ExpressionRefinementTemplateItem,
  ReferenceExpressionTemplateItem,
  ExpressionTemplateItem
} from 'parse/converters/expressions/expressionDefinitions';
import {
  TripleMustacheTemplateItem,
  InterpolatorTemplateItem
} from 'parse/converters/mustache/mustacheDefinitions';

import flattenExpression from './flattenExpression';

export function refineExpression(
  expression: ExpressionTemplateItem,
  mustache: InterpolatorTemplateItem
): InterpolatorTemplateItem;

export function refineExpression(
  expression: ExpressionTemplateItem,
  mustache: TripleMustacheTemplateItem
): TripleMustacheTemplateItem;

export function refineExpression(
  expression: ExpressionTemplateItem,
  mustache: ExpressionRefinementTemplateItem
): ExpressionRefinementTemplateItem;

export function refineExpression(
  expression: ExpressionTemplateItem,
  mustache: ExpressionRefinementTemplateItem
): ExpressionRefinementTemplateItem {
  let referenceExpression;

  if (expression) {
    while (expression.t === TemplateItemType.BRACKETED && expression.x) {
      expression = expression.x;
    }

    if (expression.t === TemplateItemType.REFERENCE) {
      const n = expression.n;
      if (!~n.indexOf('@context')) {
        mustache.r = expression.n;
      } else {
        mustache.x = flattenExpression(expression);
      }
    } else {
      if ((referenceExpression = getReferenceExpression(expression))) {
        mustache.rx = referenceExpression;
      } else {
        mustache.x = flattenExpression(expression);
      }
    }

    return mustache;
  }
}

// TODO refactor this! it's bewildering
function getReferenceExpression(
  expression: ExpressionTemplateItem
): ReferenceExpressionTemplateItem {
  const members = [];
  let refinement;

  while (
    expression.t === TemplateItemType.MEMBER &&
    expression.r.t === TemplateItemType.REFINEMENT
  ) {
    refinement = expression.r;

    if (refinement.x) {
      if (refinement.x.t === TemplateItemType.REFERENCE) {
        members.unshift(refinement.x);
      } else {
        members.unshift(flattenExpression(refinement.x));
      }
    } else {
      members.unshift(refinement.n);
    }

    expression = expression.x;
  }

  if (expression.t !== TemplateItemType.REFERENCE) {
    return null;
  }

  return {
    r: expression.n,
    m: members
  };
}
