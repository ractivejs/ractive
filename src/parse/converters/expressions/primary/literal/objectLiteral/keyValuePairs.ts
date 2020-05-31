import getKeyValuePair from './keyValuePair';
import { StandardParser } from 'parse/_parse';
import { KeyValuePairTemplateItem } from 'parse/converters/expressions/expressionDefinitions';

export default function readKeyValuePairs(parser: StandardParser): KeyValuePairTemplateItem[] {
  const start = parser.pos;

  const pair = getKeyValuePair(parser);
  if (pair === null) {
    return null;
  }

  const pairs = [pair];

  if (parser.matchString(',')) {
    const keyValuePairs = readKeyValuePairs(parser);

    if (!keyValuePairs) {
      parser.pos = start;
      return null;
    }

    return pairs.concat(keyValuePairs);
  }

  return pairs;
}
