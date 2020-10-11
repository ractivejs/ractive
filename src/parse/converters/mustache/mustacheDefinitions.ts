import type TemplateItemType from 'config/types';
import type { LinePosition } from 'parse/Parser';

import type {
  ExpressionTemplateItem,
  ExpressionRefinementTemplateItem
} from '../expressions/expressionDefinitions';
import type {
  CommentTemplateItem,
  ElementTemplateItem,
  TextTemplateItem
} from '../templateItemDefinitions';

/** @see {@link readSection} */
export type FragmentTemplateItem =
  | SectionMustacheTemplateItem
  | InterpolatorTemplateItem
  | ElementTemplateItem
  | TextTemplateItem;

export interface ClosingMustacheTemplateItem {
  t: TemplateItemType.CLOSING;

  r: string;
}

// Inline blocks >>
export interface ElseMustacheTemplateItem {
  t: TemplateItemType.ELSE;

  f?: SectionFragmentTemplateItem[];
}

export interface ElseIfMustacheTemplateItem {
  t: TemplateItemType.ELSEIF;
  x: ExpressionTemplateItem;
}

export interface ThenMustacheTemplateItem {
  t: TemplateItemType.THEN;
  n?: string;
  f?: SectionFragmentTemplateItem[];
}

export interface CatchMustacheTemplateItem {
  t: TemplateItemType.CATCH;
  n?: string;
  f?: SectionFragmentTemplateItem[];
}
// Inline blocks <<

// Alias >>
/** Single alias definition, returned value of {@link readAlias} */
export interface AliasDefinitionTemplateItem {
  n: string;

  x: ExpressionTemplateItem;
}

/**
 * Used inside {@link readAliases}.
 * Basically an {@link AliasDefinitionTemplateItem} after {@link refineExpression} invocation
 */
export interface AliasDefinitionRefinedTemplateItem {
  n: string;
  x: ExpressionRefinementTemplateItem;
}

export interface AliasTemplateItem {
  t: TemplateItemType.ALIAS;

  /** Fragments */
  f?: FragmentTemplateItem[];

  n?: TemplateItemType.SECTION_IF_WITH;

  z?: AliasDefinitionRefinedTemplateItem[];
}

// Alias <<

// Section >>
export type SectionFragmentTemplateItem =
  | FragmentTemplateItem
  | CatchMustacheTemplateItem
  | ThenMustacheTemplateItem
  | ElseMustacheTemplateItem;

export interface SectionMustacheTemplateItem extends ExpressionRefinementTemplateItem {
  t: TemplateItemType.SECTION;

  /** Fragments */
  f?: SectionFragmentTemplateItem[];

  /** todo undestrand what is this */
  l?: SectionMustacheTemplateItem[];

  /**
   * Used to store index name in each
   * @see {@link readSection}
   */
  i?: string;

  n?:
    | TemplateItemType.SECTION_IF
    | TemplateItemType.SECTION_UNLESS
    | TemplateItemType.SECTION_EACH
    | TemplateItemType.SECTION_WITH
    | TemplateItemType.SECTION_IF_WITH;

  z?: AliasDefinitionRefinedTemplateItem[];
}

export interface AwaitMustacheTemplateItem extends ExpressionRefinementTemplateItem {
  t: TemplateItemType.AWAIT;

  /** Fragments */
  f?: FragmentTemplateItem[];

  r: 'promise';
}
// Section <<

export interface InterpolatorTemplateItem extends ExpressionRefinementTemplateItem {
  t: TemplateItemType.INTERPOLATOR;

  /**
   * Fragments
   * used in {@link readAttribute}
   */
  f?: FragmentTemplateItem[];

  /** is static */
  s?: boolean;
}

export interface TripleMustacheTemplateItem extends ExpressionRefinementTemplateItem {
  t: TemplateItemType.TRIPLE;
  s?: string;
}

export interface PartialMustacheTemplateItem extends ExpressionRefinementTemplateItem {
  t: TemplateItemType.PARTIAL | TemplateItemType.YIELDER;

  c?: ExpressionRefinementTemplateItem;

  z?: AliasDefinitionRefinedTemplateItem[];
}

export interface DelimiterChangeToken {
  t: TemplateItemType.DELIMCHANGE;
  exclude: true;
}

/** Used in {@link readMustache} */
export type MustachePrimaryItem = (
  | string
  | AliasDefinitionTemplateItem
  | TripleMustacheTemplateItem
  | SectionMustacheTemplateItem
  | PartialMustacheTemplateItem
  | CommentTemplateItem
  | DelimiterChangeToken
) & {
  /** Is a static element */
  s?: 1;
  q?: LinePosition;
};
