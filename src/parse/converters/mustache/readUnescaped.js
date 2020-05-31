import { TRIPLE } from 'config/types';
import refineExpression from 'parse/utils/refineExpression';

import readExpression from '../readExpression';

export default function readUnescaped(parser, tag) {
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

  const triple = { t: TRIPLE };
  refineExpression(expression, triple); // TODO handle this differently - it's mysterious

  return triple;
}
