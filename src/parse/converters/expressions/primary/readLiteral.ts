import { StandardParser } from 'parse/_parse';
import {
  ValueTemplateItem,
  BrackedTemplateItem,
  ObjectLiteralTemplateItem,
  ArrayLiteralTemplateItem
} from 'parse/converters/expressions/expressionDefinitions';

import readArrayLiteral from './literal/readArrayLiteral';
import readBooleanLiteral from './literal/readBooleanLiteral';
import readNumberLiteral from './literal/readNumberLiteral';
import readObjectLiteral from './literal/readObjectLiteral';
import readRegexpLiteral from './literal/readRegexpLiteral';
import readStringLiteral from './literal/readStringLiteral';
import readTemplateStringLiteral from './literal/readTemplateStringLiteral';

// define output of readLiteral
export type LiteralTemplateDefinition =
  | ValueTemplateItem
  | BrackedTemplateItem
  | ObjectLiteralTemplateItem
  | ArrayLiteralTemplateItem;

export default function readLiteral(parser: StandardParser): LiteralTemplateDefinition {
  return (
    readNumberLiteral(parser) ||
    readBooleanLiteral(parser) ||
    readStringLiteral(parser) ||
    readTemplateStringLiteral(parser) ||
    readObjectLiteral(parser) ||
    readArrayLiteral(parser) ||
    readRegexpLiteral(parser)
  );
}
