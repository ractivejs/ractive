import readPrimary from './readPrimary';
import readExpressionList from './shared/readExpressionList';
import readRefinement from './shared/readRefinement';
import { expectedParen } from './shared/errors';
import TemplateItemType from 'config/types';
import { StandardParser } from 'parse/_parse';
import {
  MemberTemplateItem,
  InvocationTemplateItem,
  PrimaryExpressionTemplateDefinition
} from 'parse/converters/expressions/expressionDefinitions';

/**
 * Return value of this function must include also primary returned values
 */
export type MemberOrInvocationOrPrimary =
  | PrimaryExpressionTemplateDefinition
  | MemberTemplateItem
  | InvocationTemplateItem;

export default function readMemberOfInvocation(
  parser: StandardParser
): MemberOrInvocationOrPrimary {
  let expression: MemberOrInvocationOrPrimary = readPrimary(parser);

  if (!expression) return null;

  while (expression) {
    const refinement = readRefinement(parser);
    if (refinement) {
      expression = {
        t: TemplateItemType.MEMBER,
        x: expression,
        r: refinement
      } as MemberTemplateItem;
    } else if (parser.matchString('(')) {
      parser.sp();
      const expressionList = readExpressionList(parser, true);

      parser.sp();

      if (!parser.matchString(')')) {
        parser.error(expectedParen);
      }

      expression = {
        t: TemplateItemType.INVOCATION,
        x: expression
      } as InvocationTemplateItem;

      if (expressionList) expression.o = expressionList;
    } else {
      break;
    }
  }

  return expression;
}
