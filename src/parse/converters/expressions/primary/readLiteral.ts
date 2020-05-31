import readNumberLiteral from './literal/readNumberLiteral';
import readBooleanLiteral from './literal/readBooleanLiteral';
import readStringLiteral from './literal/readStringLiteral';
import readTemplateStringLiteral from './literal/readTemplateStringLiteral';
import readObjectLiteral from './literal/readObjectLiteral';
import readArrayLiteral from './literal/readArrayLiteral';
import readRegexpLiteral from './literal/readRegexpLiteral';
import { StandardParser } from 'parse/_parse';
import { LiteralTemplateDefinition } from 'parse/TemplateItems';

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
