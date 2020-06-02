import { StandardParser } from 'parse/_parse';
import { refineExpression } from 'parse/utils/refineExpression';

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

  let alias = readAlias(parser);

  if (alias) {
    alias.x = refineExpression(alias.x, {});
    aliases.push(alias as AliasDefinitionRefinedTemplateItem);

    parser.sp();

    while (parser.matchString(',')) {
      alias = readAlias(parser);

      if (!alias) {
        parser.error('Expected another alias.');
      }

      alias.x = refineExpression(alias.x, {});
      aliases.push(alias as AliasDefinitionRefinedTemplateItem);

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
