import TemplateItemType from 'config/types';
import { StandardParser } from 'parse/_parse';
import { refineExpression } from 'parse/utils/refineExpression';

import readExpression from '../readExpression';

import { ParserTag, TripleMustacheTemplateItem } from './mustacheDefinitions';

export default function readUnescaped(
  parser: StandardParser,
  tag: ParserTag
): TripleMustacheTemplateItem {
  if (!parser.matchString('&')) {
    return null;
  }

  parser.sp();

  const expression = readExpression(parser);

  if (!expression) {
    return null;
  }

  if (!parser.matchString(tag.close)) {
    parser.error(`Expected closing delimiter '${tag.close}'`);
  }

  const triple: TripleMustacheTemplateItem = { t: TemplateItemType.TRIPLE };
  refineExpression(expression, triple); // TODO handle this differently - it's mysterious

  // force casting since population is done as side effect of refineExpression
  return triple;
}
