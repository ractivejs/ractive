import { StandardParser } from 'parse/_parse';
import { refineExpression } from 'parse/utils/refineExpression';

import { ExpressionTemplateItem } from '../expressions/expressionDefinitions';
import readExpression from '../readExpression';

import {
  AliasDefinitionTemplateItem,
  AliasDefinitionRefinedTemplateItem
} from './mustacheDefinitions';

const legalAlias = /^(?:[a-zA-Z$_0-9]|\\\.)+(?:(?:(?:[a-zA-Z$_0-9]|\\\.)+)|(?:\[[0-9]+\]))*/;
const asRE = /^as/i;

export function readAliases(parser: StandardParser): AliasDefinitionRefinedTemplateItem[] {
  const aliases: AliasDefinitionRefinedTemplateItem[] = [];
  const start = parser.pos;

  parser.sp();

  // we are going for sure to process this alias using refineExpression
  // so force type to AliasDefinitionRefinedTemplateItem
  let alias = readAlias(parser) as AliasDefinitionRefinedTemplateItem;

  if (alias) {
    alias.x = refineExpression(alias.x as ExpressionTemplateItem, {});
    aliases.push(alias);

    parser.sp();

    while (parser.matchString(',')) {
      alias = readAlias(parser) as AliasDefinitionRefinedTemplateItem;

      if (!alias) {
        parser.error('Expected another alias.');
      }

      alias.x = refineExpression(alias.x as ExpressionTemplateItem, {});
      aliases.push(alias);

      parser.sp();
    }

    return aliases;
  }

  parser.pos = start;
  return null;
}

export function readAlias(parser: StandardParser): AliasDefinitionTemplateItem {
  const start = parser.pos;

  parser.sp();

  const expr = readExpression(parser);

  if (!expr) {
    parser.pos = start;
    return null;
  }

  parser.sp();
  parser.matchPattern(asRE);
  parser.sp();

  const alias = parser.matchPattern(legalAlias);

  if (!alias) {
    parser.pos = start;
    return null;
  }

  return { n: alias, x: expr };
}
