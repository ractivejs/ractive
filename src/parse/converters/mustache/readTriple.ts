import TemplateItemType from 'config/types';
import { StandardParser } from 'parse/_parse';
import { refineExpression } from 'parse/utils/refineExpression';

import readExpression from '../readExpression';

import { ParserTag, TripleMustacheTemplateItem } from './mustacheDefinitions';

export default function readTriple(
  parser: StandardParser,
  tag: ParserTag
): TripleMustacheTemplateItem {
  const expression = readExpression(parser);

  if (!expression) {
    return null;
  }

  if (!parser.matchString(tag.close)) {
    parser.error(`Expected closing delimiter '${tag.close}'`);
  }

  const triple: TripleMustacheTemplateItem = { t: TemplateItemType.TRIPLE };
  refineExpression(expression, triple); // TODO handle this differently - it's mysterious

  return triple;
}
