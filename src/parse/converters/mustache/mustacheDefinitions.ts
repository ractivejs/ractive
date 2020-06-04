import TemplateItemType from 'config/types';

import {
  ExpressionTemplateItem,
  ExpressionRefinementTemplateItem
} from '../expressions/expressionDefinitions';

export interface ParserTag {
  open: string;
  close: string;
}

/**
 * todo refine what items can be used as fragments (Section for sure)
 *
 * @see {@link readSection}
 */
export interface FragmentTemplateItem {
  [key: string]: any;
}

export interface ClosingMustacheTemplateItem {
  t: TemplateItemType.CLOSING;

  r: string;
}

// Inline blocks >>
export interface ElseMustacheTemplateItem {
  t: TemplateItemType.ELSE;
}

export interface ElseIfMustacheTemplateItem {
  t: TemplateItemType.ELSEIF;
  x: ExpressionTemplateItem;
}

export interface ThenMustacheTemplateItem {
  t: TemplateItemType.THEN;
  n?: string;
}

export interface CatchMustacheTemplateItem {
  t: TemplateItemType.THEN;
  n?: string;
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
export interface SectionMustacheTemplateItem extends ExpressionRefinementTemplateItem {
  t: TemplateItemType.SECTION;

  /** Fragments */
  f?: FragmentTemplateItem[];

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
    | TemplateItemType.SECTION_IF_WITH;

  z?: AliasDefinitionRefinedTemplateItem[];
}

export interface AwaitMustacheTemplateItem {
  t: TemplateItemType.AWAIT;

  /** Fragments */
  f?: FragmentTemplateItem[];

  r: 'promise';
}
// Section <<

export interface InterpolatorTemplateItem extends ExpressionRefinementTemplateItem {
  t: TemplateItemType.INTERPOLATOR;
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
