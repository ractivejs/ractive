import TemplateItemType from 'config/types';
import { StandardParser } from 'parse/_parse';

import { ExpressionTemplateItem, ReferenceTemplateItem } from './expressions/expressionDefinitions';
import readReference from './expressions/primary/readReference';
import readExpression from './readExpression';

export default function readExpressionOrReference(
  parser: StandardParser,
  expectedFollowers: string[]
): ExpressionTemplateItem | ReferenceTemplateItem {
  const start = parser.pos;
  const expression = readExpression(parser);

  if (!expression) {
    // valid reference but invalid expression e.g. `{{new}}`?
    const ref = parser.matchPattern(/^(\w+)/);
    if (ref) {
      return {
        t: TemplateItemType.REFERENCE,
        n: ref
      };
    }

    return null;
  }

  for (let i = 0; i < expectedFollowers.length; i += 1) {
    if (parser.remaining().substr(0, expectedFollowers[i].length) === expectedFollowers[i]) {
      return expression;
    }
  }

  parser.pos = start;
  return readReference(parser);
}
