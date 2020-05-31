import readNumberLiteral from './literal/readNumberLiteral';
import readBooleanLiteral from './literal/readBooleanLiteral';
import readStringLiteral from './literal/readStringLiteral';
import readTemplateStringLiteral from './literal/readTemplateStringLiteral';
import readObjectLiteral from './literal/readObjectLiteral';
import readArrayLiteral from './literal/readArrayLiteral';
import readRegexpLiteral from './literal/readRegexpLiteral';
import { StandardParser } from 'parse/_parse';
import {
  ValueTemplateItem,
  BrackedTemplateItem,
  ObjectLiteralTemplateItem,
  ArrayLiteralTemplateItem
} from 'parse/converters/expressions/expressionDefinitions';

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
