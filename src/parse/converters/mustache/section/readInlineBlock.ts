import TemplateItemType from 'config/types';
import { StandardParser, StandardParserTag } from 'parse/_parse';

import { name } from '../../expressions/shared/patterns';
import readExpression from '../../readExpression';
import {
  ElseMustacheTemplateItem,
  ElseIfMustacheTemplateItem,
  ThenMustacheTemplateItem,
  CatchMustacheTemplateItem
} from '../mustacheDefinitions';

export type InlineBlockType = 'else' | 'elseif' | 'then' | 'catch';

/**
 * Auxilliary support configuration for readInlineBlock. Include template type and pattern
 */
const InlinBlockConfig: { [key: string]: [TemplateItemType, RegExp] } = {
  else: [TemplateItemType.ELSE, /^\s*else\s*/],
  elseif: [TemplateItemType.ELSEIF, /^\s*elseif\s+/],
  then: [TemplateItemType.THEN, /^\s*then\s*/],
  catch: [TemplateItemType.CATCH, /^\s*catch\s*/]
};

type InlineBlockTemplateItem =
  | ElseMustacheTemplateItem
  | ElseIfMustacheTemplateItem
  | ThenMustacheTemplateItem
  | CatchMustacheTemplateItem;

export function readInlineBlock(
  parser: StandardParser,
  tag: StandardParserTag,
  type: 'else'
): ElseMustacheTemplateItem;

export function readInlineBlock(
  parser: StandardParser,
  tag: StandardParserTag,
  type: 'elseif'
): ElseIfMustacheTemplateItem;

export function readInlineBlock(
  parser: StandardParser,
  tag: StandardParserTag,
  type: 'then' | 'catch'
): ThenMustacheTemplateItem | CatchMustacheTemplateItem;

export function readInlineBlock(
  parser: StandardParser,
  tag: StandardParserTag,
  type: InlineBlockType
): InlineBlockTemplateItem {
  const start = parser.pos;

  if (!parser.matchString(tag.open)) {
    return null;
  }

  const [templateType, pattern] = InlinBlockConfig[type];

  if (!parser.matchPattern(pattern)) {
    parser.pos = start;
    return null;
  }

  const res = { t: templateType } as InlineBlockTemplateItem;

  if (type === 'elseif') {
    (res as ElseIfMustacheTemplateItem).x = readExpression(parser);
  } else if (type === 'catch' || type === 'then') {
    const nm = parser.matchPattern(name);
    if (nm) (res as CatchMustacheTemplateItem | ThenMustacheTemplateItem).n = nm;
  }

  if (!parser.matchString(tag.close)) {
    parser.error(`Expected closing delimiter '${tag.close}'`);
  }

  return res;
}
