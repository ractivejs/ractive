import Parser, { CustomParser } from 'parse/Parser';
import readStringLiteral from 'parse/converters/expressions/primary/literal/readStringLiteral';
import readKey from 'parse/converters/expressions/shared/readKey';
import { hasOwn, keys } from 'utils/object';
import { BaseParseOpts } from 'types/ParseOptions';
import { SimpleTemplateItem } from 'parse/converters/expressions/expressionDefinitions';

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

class JsonParser extends Parser implements CustomParser {
  private values;

  init(_str, options): void {
    this.values = options.values;

    this.converters = [
      function getPlaceholder(parser: JsonParser): SimpleTemplateItem {
        if (!parser.values) return null;

        const placeholder = parser.matchPattern(placeholderAtStartPattern);

        if (placeholder && hasOwn(parser.values, placeholder)) {
          return { v: parser.values[placeholder] };
        }
      },

      function getSpecial(parser: JsonParser): SimpleTemplateItem {
        const special = parser.matchPattern(specialsPattern);
        if (special) return { v: specials[special] };
      },

      function getNumber(parser: JsonParser): SimpleTemplateItem {
        const number = parser.matchPattern(numberPattern);
        if (number) return { v: +number };
      },

      function getString(parser: JsonParser): SimpleTemplateItem {
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

      function getObject(parser: JsonParser): SimpleTemplateItem {
        if (!parser.matchString('{')) return null;

        const result = {};

        parser.sp();

        if (parser.matchString('}')) {
          return { v: result };
        }

        let pair;
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

      function getArray(parser: JsonParser): SimpleTemplateItem {
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

  postProcess(result): any {
    if (result.length !== 1 || !onlyWhitespace.test(this.leftover)) {
      return null;
    }

    return { value: result[0].v };
  }
}

function getKeyValuePair(parser) {
  parser.sp();

  const key = readKey(parser);

  if (!key) return null;

  const pair: { [key: string]: any } = { key };

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

export default function(str: string, values: object): any {
  const parser = new JsonParser(str, { values } as BaseParseOpts);
  return parser.result;
}
