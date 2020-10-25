import TemplateItemType from 'config/types';
import type { StandardParser } from 'parse/_parse';
import flattenExpression from 'parse/utils/flattenExpression';
import { refineExpression } from 'parse/utils/refineExpression';

import type { ExpressionTemplateItem } from '../expressions/expressionDefinitions';
import readExpressionList from '../expressions/shared/readExpressionList';
import type { InterpolatorTemplateItem } from '../mustache/mustacheDefinitions';
import readExpressionOrReference from '../readExpressionOrReference';
import type { ExpressionFunctionTemplateItem } from '../templateItemDefinitions';

import {
  BindingFlagDirectiveTemplateItem,
  AttributesOrDirectiveTemplateItem,
  DecoratorDirectiveTemplateItem,
  TransitionDirectiveTemplateItem,
  TransitionTrigger,
  EventDirectiveTemplateItem,
  GenericAttributeTemplateItem,
  AttributeWithArguments,
  BindingFlagDirectiveFunction,
  BindingFlagDirectiveValue,
  GenericAttributeTemplateValue
} from './elementDefinitions';
import { readAttributeValue } from './utils/readAttributeValue';

const attributeNamePattern = /^[^\s"'>\/=(]+/;
const onPattern = /^on/;
const eventPattern = /^on-([a-zA-Z\*\.$_]((?:[a-zA-Z\*\.$_0-9\-]|\\-)+))$/;

const reservedEventNamesList = [
  'change',
  'reset',
  'teardown',
  'update',
  'construct',
  'config',
  'init',
  'render',
  'complete',
  'unrender',
  'detach',
  'insert',
  'destruct',
  'attachchild',
  'detachchild'
];
const reservedEventNames = new RegExp(`^(?:${reservedEventNamesList.join('|')})$`);

const decoratorPattern = /^as-([a-z-A-Z][-a-zA-Z_0-9]*)$/;
const transitionPattern = /^([a-zA-Z](?:(?!-in-out)[-a-zA-Z_0-9])*)-(in|out|in-out)$/;
const boundPattern = /^((bind|class)-(([-a-zA-Z0-9_])+))$/;

interface DirectiveConfig {
  t: TemplateItemType.BINDING_FLAG;
  v?: BindingFlagDirectiveValue;
}
const directives: { [key: string]: DirectiveConfig } = {
  lazy: { t: TemplateItemType.BINDING_FLAG, v: 'l' },
  twoway: { t: TemplateItemType.BINDING_FLAG, v: 't' }
};

const proxyEvent = /^[^\s"'=<>@\[\]()]*/;
const whitespace = /^\s+/;

export function readAttributeOrDirective(
  parser: StandardParser
): AttributesOrDirectiveTemplateItem {
  let match: RegExpExecArray, directive: DirectiveConfig;

  const attributeName = readAttributeName(parser);

  if (!attributeName) return null;

  let attribute: AttributesOrDirectiveTemplateItem;

  if ((directive = directives[attributeName])) {
    // lazy, twoway
    const directiveTemplatrItem: BindingFlagDirectiveTemplateItem = {
      t: directive.t,
      v: directive.v
    };

    parser.sp();

    if (parser.nextChar() === '=')
      directiveTemplatrItem.f = readAttributeValue(parser) as BindingFlagDirectiveFunction;

    attribute = directiveTemplatrItem;
  } else if (attributeName === 'no-delegation') {
    // no-delegation directive
    attribute = {
      t: TemplateItemType.DELEGATE_FLAG
    };
  } else if ((match = decoratorPattern.exec(attributeName))) {
    // decorators
    const decoratorTemplateItem: DecoratorDirectiveTemplateItem = {
      t: TemplateItemType.DECORATOR,
      n: match[1]
    };

    readArguments(parser, decoratorTemplateItem);

    attribute = decoratorTemplateItem;
  } else if ((match = transitionPattern.exec(attributeName))) {
    // transitions
    const transitionTemplateItem: TransitionDirectiveTemplateItem = {
      t: TemplateItemType.TRANSITION,
      n: match[1],
      v:
        match[2] === 'in-out'
          ? TransitionTrigger.INTRO_OUTRO
          : match[2] === 'in'
          ? TransitionTrigger.INTRO
          : TransitionTrigger.OUTRO
    };
    readArguments(parser, transitionTemplateItem);

    attribute = transitionTemplateItem;
  } else if ((match = eventPattern.exec(attributeName))) {
    // on-click etc
    const eventTemplateItem: EventDirectiveTemplateItem = {
      t: TemplateItemType.EVENT,
      n: splitEvent(match[1]),
      f: undefined
    };

    if (parser.matchString('(')) {
      eventTemplateItem.a = flattenExpression({
        t: TemplateItemType.ARRAY_LITERAL,
        m: readExpressionList(parser)
      });
      if (!parser.matchString(')')) parser.error(`Expected closing ')'`);
    }

    parser.inEvent = true;

    // check for a proxy event
    if (!readProxyEvent(parser, eventTemplateItem)) {
      // otherwise, it's an expression
      readArguments(parser, eventTemplateItem, true);
    } else if (reservedEventNames.test(eventTemplateItem.f as string)) {
      parser.pos -= (eventTemplateItem.f as string).length;
      parser.error(`Cannot use reserved event names (${reservedEventNamesList.join(' ')})`);
    }

    parser.inEvent = false;

    attribute = eventTemplateItem;
  } else if ((match = boundPattern.exec(attributeName))) {
    // bound directives
    const bind = match[2] === 'bind';
    const genericAttributeTemplateItem: GenericAttributeTemplateItem = {
      t: TemplateItemType.ATTRIBUTE,
      n: bind ? match[3] : match[1]
    };
    readArguments(parser, genericAttributeTemplateItem, false, true);

    if (!genericAttributeTemplateItem.f && bind) {
      genericAttributeTemplateItem.f = [{ t: TemplateItemType.INTERPOLATOR, r: match[3] }];
    }

    attribute = genericAttributeTemplateItem;
  } else {
    parser.sp();
    const value: GenericAttributeTemplateValue =
      parser.nextChar() === '=' ? readAttributeValue(parser) : null;

    if (parser.sanitizeEventAttributes && onPattern.test(attributeName)) {
      return { exclude: true };
    }

    const f = value != null ? value : value === '' ? '' : 0;
    const genericAttributeTemplateItem: GenericAttributeTemplateItem = {
      t: TemplateItemType.ATTRIBUTE,
      n: attributeName,
      f
    };

    attribute = genericAttributeTemplateItem;
  }

  return attribute;
}

const slashes = /\\/g;
function splitEvent(str: string): string[] {
  const result = [];
  let s = 0;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === '-' && str[i - 1] !== '\\') {
      result.push(str.substring(s, i).replace(slashes, ''));
      s = i + 1;
    }
  }

  result.push(str.substring(s).replace(slashes, ''));

  return result;
}

function readAttributeName(parser: StandardParser): string {
  let name, i, nearest, idx;

  parser.sp();

  name = parser.matchPattern(attributeNamePattern);
  if (!name) {
    return null;
  }

  // check for accidental delimiter consumption e.g. <tag bool{{>attrs}} />
  nearest = name.length;
  for (i = 0; i < parser.tags.length; i++) {
    if (~(idx = name.indexOf(parser.tags[i].open))) {
      if (idx < nearest) nearest = idx;
    }
  }
  if (nearest < name.length) {
    parser.pos -= name.length - nearest;
    name = name.substr(0, nearest);
    if (!name) return null;
  }

  return name;
}

function readProxyEvent(
  parser: StandardParser,
  attribute: EventDirectiveTemplateItem
): boolean | string | ExpressionFunctionTemplateItem {
  const start = parser.pos;
  if (!parser.matchString('=')) parser.error(`Missing required directive arguments`);

  const quote = parser.matchString(`'`) || parser.matchString(`"`);
  parser.sp();
  const proxy = parser.matchPattern(proxyEvent);

  if (proxy !== undefined) {
    if (quote) {
      parser.sp();
      if (!parser.matchString(quote)) parser.pos = start;
      else return (attribute.f = proxy) || true;
    } else if (!parser.matchPattern(whitespace)) {
      parser.pos = start;
    } else {
      return (attribute.f = proxy) || true;
    }
  } else {
    parser.pos = start;
  }
}

/**
 * Integrate the param attribute with the arguments contained in the template and store them in the `f` property
 */
function readArguments(
  parser: StandardParser,
  attribute: DecoratorDirectiveTemplateItem | TransitionDirectiveTemplateItem
): void;
function readArguments(
  parser: StandardParser,
  attribute: EventDirectiveTemplateItem,
  required: true
): void;
function readArguments(
  parser: StandardParser,
  attribute: GenericAttributeTemplateItem,
  required: false,
  single: true
): void;
function readArguments(
  parser: StandardParser,
  attribute: AttributeWithArguments,
  required = false,
  single = false
): void {
  parser.sp();
  if (!parser.matchString('=')) {
    if (required) parser.error(`Missing required directive arguments`);
    return;
  }
  parser.sp();

  const quote = parser.matchString('"') || parser.matchString("'");
  const spread = parser.spreadArgs;
  parser.spreadArgs = true;
  parser.inUnquotedAttribute = !quote;
  const expr = single
    ? readExpressionOrReference(parser, [quote || ' ', '/', '>'])
    : { m: readExpressionList(parser), t: TemplateItemType.ARRAY_LITERAL };
  parser.inUnquotedAttribute = false;
  parser.spreadArgs = spread;

  if (quote) {
    parser.sp();
    if (parser.matchString(quote) !== quote) parser.error(`Expected matching quote '${quote}'`);
  }

  if (single) {
    // only for GenericAttributeTemplateItem
    const interpolator: InterpolatorTemplateItem = { t: TemplateItemType.INTERPOLATOR };
    refineExpression(expr as ExpressionTemplateItem, interpolator);
    attribute.f = [interpolator];
  } else {
    attribute.f = flattenExpression(expr as ExpressionTemplateItem);
  }
}
