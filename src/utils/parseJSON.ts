import readStringLiteral from 'parse/converters/expressions/primary/literal/readStringLiteral';
import readKey from 'parse/converters/expressions/shared/readKey';
import Parser from 'parse/Parser';
import { hasOwn, keys } from 'utils/object';

interface KeyValuePair {
  key: string;
  value?: string;
}

/**
 * simple JSON parser, without the restrictions of JSON parse
 * (i.e. having to double-quote keys).
 *
 * If passed a hash of values as the second argument, ${placeholders}
 * will be replaced with those values
 */
const specials = {
  true: true,
  false: false,
  null: null,
  undefined
};

const specialsPattern = new RegExp('^(?:' + keys(specials).join('|') + ')');
const numberPattern = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
const placeholderPattern = /\$\{([^\}]+)\}/g;
const placeholderAtStartPattern = /^\$\{([^\}]+)\}/;
const onlyWhitespace = /^\s*$/;

export interface JsonParserOpts {
  values: JsonParser['values'];
}

export type JsonParserResult = { value: Record<string, unknown> };

interface JsonParserItem<T = unknown> {
  v: T;
}

class JsonParser extends Parser<JsonParserOpts, JsonParserResult> {
  values: Record<string, unknown>;

  init(_str: string, options: JsonParserOpts): void {
    this.values = options.values;

    this.converters = [
      function getPlaceholder(parser: JsonParser): JsonParserItem {
        if (!parser.values) return null;

        const placeholder = parser.matchPattern(placeholderAtStartPattern);

        if (placeholder && hasOwn(parser.values, placeholder)) {
          return { v: parser.values[placeholder] };
        }
      },

      function getSpecial(parser: JsonParser): JsonParserItem {
        const special = parser.matchPattern(specialsPattern);
        if (special) return { v: specials[special] };
      },

      function getNumber(parser: JsonParser): JsonParserItem {
        const number = parser.matchPattern(numberPattern);
        if (number) return { v: +number };
      },

      function getString(parser: JsonParser): JsonParserItem {
        const stringLiteral = readStringLiteral(parser);
        const values = parser.values;

        if (stringLiteral && values) {
          return {
            v: stringLiteral.v.replace(placeholderPattern, (_match, $1) =>
              $1 in values ? values[$1] : $1
            )
          };
        }

        return stringLiteral;
      },

      function getObject(parser: JsonParser): JsonParserItem {
        if (!parser.matchString('{')) return null;

        const result = {};

        parser.sp();

        if (parser.matchString('}')) {
          return { v: result };
        }

        let pair: KeyValuePair;
        while ((pair = getKeyValuePair(parser))) {
          result[pair.key] = pair.value;

          parser.sp();

          if (parser.matchString('}')) {
            return { v: result };
          }

          if (!parser.matchString(',')) {
            return null;
          }
        }

        return null;
      },

      function getArray(parser: JsonParser): JsonParserItem {
        if (!parser.matchString('[')) return null;

        const result = [];

        parser.sp();

        if (parser.matchString(']')) {
          return { v: result };
        }

        let valueToken;
        while ((valueToken = parser.read())) {
          result.push(valueToken.v);

          parser.sp();

          if (parser.matchString(']')) {
            return { v: result };
          }

          if (!parser.matchString(',')) {
            return null;
          }

          parser.sp();
        }

        return null;
      }
    ];

    this.sp();
  }

  postProcess(result: JsonParserItem<Record<string, unknown>>[]): JsonParserResult {
    if (result.length !== 1 || !onlyWhitespace.test(this.leftover)) {
      return null;
    }

    return { value: result[0].v };
  }
}

function getKeyValuePair(parser: JsonParser): KeyValuePair {
  parser.sp();

  const key = readKey(parser);

  if (!key) return null;

  const pair: KeyValuePair = { key };

  parser.sp();
  if (!parser.matchString(':')) {
    return null;
  }
  parser.sp();

  const valueToken = parser.read();

  if (!valueToken) return null;

  pair.value = valueToken.v;
  return pair;
}

export default function parseJSON(
  str: string,
  values?: JsonParserOpts['values']
): ReturnType<JsonParser['postProcess']> {
  const parser = new JsonParser(str, { values });
  return parser.result;
}
