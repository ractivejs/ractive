import TemplateItemType from 'config/types';
import { READERS, StandardParser, StandardParserTag } from 'parse/_parse';
import { refineExpression } from 'parse/utils/refineExpression';
import { keys } from 'utils/object';

import { ExpressionTemplateItem } from '../expressions/expressionDefinitions';
import { name } from '../expressions/shared/patterns';
import readExpression from '../readExpression';

import handlebarsBlockCodes from './handlebarsBlockCodes';
import {
  SectionMustacheTemplateItem,
  AliasTemplateItem,
  FragmentTemplateItem,
  AwaitMustacheTemplateItem
} from './mustacheDefinitions';
import { readAlias, readAliases } from './readAliases';
import readClosing from './section/readClosing';
import { readInlineBlock } from './section/readInlineBlock';

const indexRefPattern = /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/;
const keyIndexRefPattern = /^\s*,\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/;
const handlebarsBlockPattern = new RegExp('^(' + keys(handlebarsBlockCodes).join('|') + ')\\b');

export default function readSection(
  parser: StandardParser,
  tag: StandardParserTag
): SectionMustacheTemplateItem | AliasTemplateItem | AwaitMustacheTemplateItem {
  let expression: ExpressionTemplateItem;
  let section: SectionMustacheTemplateItem | AliasTemplateItem | AwaitMustacheTemplateItem;
  let child;
  let children;
  let hasElse;
  let block;
  let unlessBlock;
  let closed;
  let i;
  let expectedClose;
  let hasThen;
  let hasCatch;
  let inlineThen;
  let aliasOnly = false;

  const start = parser.pos;

  if (parser.matchString('^')) {
    // watch out for parent context refs - {{^^/^^/foo}}
    if (parser.matchString('^/')) {
      parser.pos = start;
      return null;
    }

    section = {
      t: TemplateItemType.SECTION,
      f: [],
      n: TemplateItemType.SECTION_UNLESS
    } as SectionMustacheTemplateItem;
  } else if (parser.matchString('#')) {
    section = { t: TemplateItemType.SECTION, f: [] };

    if (parser.matchString('partial')) {
      parser.pos = start - parser.standardDelimiters[0].length;
      parser.error(
        'Partial definitions can only be at the top level of the template, or immediately inside components'
      );
    }

    if ((block = parser.matchString('await'))) {
      expectedClose = block;
      ((section as unknown) as AwaitMustacheTemplateItem).t = TemplateItemType.AWAIT;
    } else if ((block = parser.matchPattern(handlebarsBlockPattern))) {
      expectedClose = block;
      section.n = handlebarsBlockCodes[block];
    }
  } else {
    return null;
  }

  parser.sp();

  if (block === 'with') {
    const aliases = readAliases(parser);
    if (aliases) {
      aliasOnly = true;
      section.z = aliases;

      ((section as unknown) as AliasTemplateItem).t = TemplateItemType.ALIAS;
    }
  } else if (block === 'each') {
    const alias = readAlias(parser);
    if (alias) {
      section.z = [{ n: alias.n, x: { r: '.' } }];
      expression = alias.x;
    }
  }

  if (!aliasOnly) {
    if (!expression) expression = readExpression(parser);

    if (!expression) {
      parser.error('Expected expression');
    }

    // extra each aliases
    if (block === 'each' && parser.matchString(',')) {
      const aliases = readAliases(parser);
      if (aliases) {
        if (section.z) aliases.unshift(section.z[0]);
        section.z = aliases;
      }
    }

    // optional index and key references
    if ((block === 'each' || !block) && (i = parser.matchPattern(indexRefPattern))) {
      let extra;

      if ((extra = parser.matchPattern(keyIndexRefPattern))) {
        section.i = i + ',' + extra;
      } else {
        section.i = i;
      }
    } else if (block === 'await' && parser.matchString('then')) {
      parser.sp();
      hasThen = true;
      inlineThen = parser.matchPattern(name);
      if (!inlineThen) inlineThen = true;
    }

    if (!block && 'n' in expression) {
      expectedClose = expression.n;
    }
  }

  parser.sp();

  if (!parser.matchString(tag.close)) {
    parser.error(`Expected closing delimiter '${tag.close}'`);
  }

  parser.sectionDepth += 1;
  children = section.f;

  let pos;
  do {
    pos = parser.pos;
    if ((child = readClosing(parser, tag))) {
      if (expectedClose && child.r !== expectedClose) {
        if (!block) {
          if (child.r)
            parser.warn(
              `Expected ${tag.open}/${expectedClose}${tag.close} but found ${tag.open}/${child.r}${tag.close}`
            );
        } else {
          parser.pos = pos;
          parser.error(`Expected ${tag.open}/${expectedClose}${tag.close}`);
        }
      }

      parser.sectionDepth -= 1;
      closed = true;
    } else if (
      !aliasOnly &&
      ((child = readInlineBlock(parser, tag, 'elseif')) ||
        (child = readInlineBlock(parser, tag, 'else')) ||
        (block === 'await' &&
          ((child = readInlineBlock(parser, tag, 'then')) ||
            (child = readInlineBlock(parser, tag, 'catch')))))
    ) {
      if (section.n === TemplateItemType.SECTION_UNLESS) {
        parser.error('{{else}} not allowed in {{#unless}}');
      }

      if (hasElse) {
        if (child.t === TemplateItemType.ELSE) {
          parser.error('there can only be one {{else}} block, at the end of a section');
        } else if (child.t === TemplateItemType.ELSEIF) {
          parser.error('illegal {{elseif...}} after {{else}}');
        }
      }

      if (!unlessBlock && (inlineThen || !hasThen) && !hasCatch) {
        if (block === 'await') {
          const s: any = { f: children };
          section.f = [s];
          if (inlineThen) {
            s.t = TemplateItemType.THEN;
            inlineThen !== true && (s.n = inlineThen);
          } else {
            s.t = TemplateItemType.SECTION;
          }
        } else {
          unlessBlock = [];
        }
      }

      const mustache: FragmentTemplateItem = {
        t: TemplateItemType.SECTION,
        f: children = []
      };

      if (child.t === TemplateItemType.ELSE) {
        if (block === 'await') {
          section.f.push(mustache);
          mustache.t = TemplateItemType.ELSE;
        } else {
          mustache.n = TemplateItemType.SECTION_UNLESS;
          unlessBlock.push(mustache);
        }
        hasElse = true;
      } else if (child.t === TemplateItemType.ELSEIF) {
        mustache.n = TemplateItemType.SECTION_IF;
        refineExpression(child.x, mustache);
        unlessBlock.push(mustache);
      } else if (child.t === TemplateItemType.THEN) {
        if (hasElse) parser.error('{{then}} block must appear before any {{else}} block');
        if (hasCatch) parser.error('{{then}} block must appear before any {{catch}} block');
        if (hasThen) parser.error('there can only be one {{then}} block per {{#await}}');
        mustache.t = TemplateItemType.THEN;
        hasThen = true;
        child.n && (mustache.n = child.n);
        section.f.push(mustache);
      } else if (child.t === TemplateItemType.CATCH) {
        if (hasElse) parser.error('{{catch}} block must appear before any {{else}} block');
        if (hasCatch) parser.error('there can only be one {{catch}} block per {{#await}}');
        mustache.t = TemplateItemType.CATCH;
        hasCatch = true;
        mustache.n = child.n;
        section.f.push(mustache);
      }
    } else {
      child = parser.read(READERS);

      if (!child) {
        break;
      }

      children.push(child);
    }
  } while (!closed);

  if (unlessBlock) {
    section.l = unlessBlock;
  }

  if (!aliasOnly) {
    refineExpression(expression, section);
  }

  if (block === 'await' && (inlineThen || !hasThen) && !hasCatch && !hasElse) {
    const s: FragmentTemplateItem = { f: section.f };
    section.f = [s];
    if (inlineThen) {
      s.t = TemplateItemType.THEN;
      inlineThen !== true && (s.n = inlineThen);
    } else {
      s.t = TemplateItemType.SECTION;
    }
  }

  // TODO if a section is empty it should be discarded. Don't do
  // that here though - we need to clean everything up first, as
  // it may contain removeable whitespace. As a temporary measure,
  // to pass the existing tests, remove empty `f` arrays
  if (!section.f.length) {
    delete section.f;
  }

  return section;
}
