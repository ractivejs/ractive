import TemplateItemType from 'config/types';
import {
  ExpressionTemplateItem,
  ArrayLiteralTemplateItem,
  ObjectLiteralTemplateItem,
  PrefixOperatorTemplateItem,
  ConditionalOperatorTemplateItem,
  InvocationTemplateItem,
  MemberTemplateItem,
  BrackedTemplateItem,
  KeyValuePairTemplateItem,
  ExpressionWithSpread,
  ExpressionWithValue
} from 'parse/converters/expressions/expressionDefinitions';
import { ExpressionFunctionTemplateItem } from 'parse/converters/templateItemDefinitions';
import { isString, isArray } from 'utils/is';

export default function flattenExpression(
  expression: ExpressionTemplateItem
): ExpressionFunctionTemplateItem {
  let refs;
  let count = 0;

  extractRefs(expression, (refs = []));
  const stringified = stringify(expression);

  return {
    r: refs,
    s: getVars(stringified)
  };

  function getVars(expr: string): string {
    const vars = [];
    for (let i = count - 1; i >= 0; i--) {
      vars.push(`x$${i}`);
    }
    return vars.length ? `(function(){var ${vars.join(',')};return(${expr});})()` : expr;
  }

  function stringify(node: ExpressionTemplateItem): string {
    if (isString(node)) {
      return node;
    }

    switch (node.t) {
      case TemplateItemType.BOOLEAN_LITERAL:
      case TemplateItemType.GLOBAL:
      case TemplateItemType.NUMBER_LITERAL:
      case TemplateItemType.REGEXP_LITERAL:
        return node.v;

      case TemplateItemType.STRING_LITERAL:
        return JSON.stringify(String(node.v));

      case TemplateItemType.ARRAY_LITERAL:
        if (node.m && hasSpread(node.m)) {
          return `[].concat(${makeSpread(node.m, '[', ']', stringify)})`;
        } else {
          return '[' + (node.m ? node.m.map(stringify).join(',') : '') + ']';
        }

      case TemplateItemType.OBJECT_LITERAL:
        if (node.m && hasSpread(node.m)) {
          return `Object.assign({},${makeSpread(node.m, '{', '}', stringifyPair)})`;
        } else {
          return '{' + (node.m ? node.m.map(n => `${n.k}:${stringify(n.v)}`).join(',') : '') + '}';
        }

      case TemplateItemType.PREFIX_OPERATOR:
        return (node.s === 'typeof' ? 'typeof ' : node.s) + stringify(node.o);

      case TemplateItemType.INFIX_OPERATOR:
        return (
          stringify(node.o[0]) +
          (node.s.substr(0, 2) === 'in' ? ' ' + node.s + ' ' : node.s) +
          stringify(node.o[1])
        );

      case TemplateItemType.INVOCATION:
        if (node.o && hasSpread(node.o)) {
          const id = count++;
          return `(x$${id}=${stringify(node.x)}).apply(x$${id},${stringify({
            t: TemplateItemType.ARRAY_LITERAL,
            m: node.o
          })})`;
        } else {
          return stringify(node.x) + '(' + (node.o ? node.o.map(stringify).join(',') : '') + ')';
        }

      case TemplateItemType.BRACKETED:
        return '(' + stringify(node.x) + ')';

      case TemplateItemType.MEMBER:
        return stringify(node.x) + stringify(node.r);

      case TemplateItemType.REFINEMENT:
        return node.n ? '.' + node.n : '[' + stringify(node.x) + ']';

      case TemplateItemType.CONDITIONAL:
        return stringify(node.o[0]) + '?' + stringify(node.o[1]) + ':' + stringify(node.o[2]);

      case TemplateItemType.REFERENCE:
        return '_' + refs.indexOf(node.n);

      default:
        throw new Error('Expected legal JavaScript');
    }
  }

  function stringifyPair(node): string {
    return node.p ? stringify(node.k) : `${node.k}:${stringify(node.v)}`;
  }

  function makeSpread(
    list: any[],
    open: string,
    close: string,
    fn: typeof stringify | typeof stringifyPair
  ): string {
    const out = list.reduce(
      (a, c) => {
        if (c.p) {
          a.str += `${a.open ? close + ',' : a.str.length ? ',' : ''}${fn(c)}`;
        } else {
          a.str += `${!a.str.length ? open : !a.open ? ',' + open : ','}${fn(c)}`;
        }
        a.open = !c.p;
        return a;
      },
      { open: false, str: '' }
    );
    if (out.open) out.str += close;
    return out.str;
  }
}

function hasSpread(list): list is ExpressionWithSpread {
  for (let i = 0; i < list.length; i++) {
    if (list[i].p) return true;
  }

  return false;
}

// TODO maybe refactor this?
function extractRefs(node: ExpressionTemplateItem, refs: string[]): void {
  if (node.t === TemplateItemType.REFERENCE && isString(node.n)) {
    if (!~refs.indexOf(node.n)) {
      refs.unshift(node.n);
    }
  }

  type NodeWithOperators =
    | PrefixOperatorTemplateItem
    | ConditionalOperatorTemplateItem
    | InvocationTemplateItem;
  type NodeWithModel = ArrayLiteralTemplateItem | ObjectLiteralTemplateItem;
  const list = (node as NodeWithOperators).o || (node as NodeWithModel).m;
  if (list) {
    if (isArray(list)) {
      let i = list.length;
      while (i--) {
        extractRefs(list[i] as ExpressionTemplateItem, refs);
      }
    } else {
      extractRefs(list as ExpressionTemplateItem, refs);
    }
  }

  const nodeAsKeyValuePair = (node as unknown) as KeyValuePairTemplateItem;
  if (
    nodeAsKeyValuePair.k &&
    nodeAsKeyValuePair.t === TemplateItemType.KEY_VALUE_PAIR &&
    !isString(nodeAsKeyValuePair.k)
  ) {
    extractRefs(nodeAsKeyValuePair.k, refs);
  }

  const nodeWithExpression = node as
    | InvocationTemplateItem
    | MemberTemplateItem
    | BrackedTemplateItem;
  if (nodeWithExpression.x) {
    extractRefs(nodeWithExpression.x, refs);
  }

  const nodeAsMember = node as MemberTemplateItem;
  if (nodeAsMember.r) {
    extractRefs(nodeAsMember.r, refs);
  }

  const nodeWithValue = node as ExpressionWithValue;
  if (nodeWithValue.v) {
    extractRefs(nodeWithValue.v, refs);
  }
}
