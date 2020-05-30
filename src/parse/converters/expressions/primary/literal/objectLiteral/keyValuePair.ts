import TemplateItemType from 'config/types';
import readKey from '../../../shared/readKey';
import readExpression from 'parse/converters/readExpression';
import { name as namePattern, spreadPattern } from '../../../shared/patterns';
import { StandardParser } from 'parse/_parse';
import { KeyValuePairTemplateItem } from 'parse/TemplateItems';

export default function readKeyValuePair(parser: StandardParser): KeyValuePairTemplateItem {
  let spread;
  const start = parser.pos;

  // allow whitespace between '{' and key
  parser.sp();

  const refKey = parser.nextChar() !== "'" && parser.nextChar() !== '"';
  if (refKey) spread = parser.matchPattern(spreadPattern);

  const key = spread ? readExpression(parser) : readKey(parser);
  if (key === null) {
    parser.pos = start;
    return null;
  }

  // allow whitespace between key and ':'
  parser.sp();

  // es2015 shorthand property
  if (refKey && (parser.nextChar() === ',' || parser.nextChar() === '}')) {
    if (!spread && !namePattern.test(key)) {
      parser.error(`Expected a valid reference, but found '${key}' instead.`);
    }

    const pair: KeyValuePairTemplateItem = {
      t: TemplateItemType.KEY_VALUE_PAIR,
      k: key,
      v: {
        t: TemplateItemType.REFERENCE,
        n: key
      }
    };

    if (spread) {
      pair.p = true;
    }

    return pair;
  }

  // next character must be ':'
  if (!parser.matchString(':')) {
    parser.pos = start;
    return null;
  }

  // allow whitespace between ':' and value
  parser.sp();

  // next expression must be a, well... expression
  const value = readExpression(parser);
  if (value === null) {
    parser.pos = start;
    return null;
  }

  return {
    t: TemplateItemType.KEY_VALUE_PAIR,
    k: key,
    v: value
  };
}
