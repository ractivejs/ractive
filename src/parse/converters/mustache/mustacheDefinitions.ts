import TemplateItemType from 'config/types';

import { ExpressionTemplateItem } from '../expressions/expressionDefinitions';

export interface TagConverter {
  open: string;
  close: string;
}

export interface ClosingMustacheTemplateItem {
  t: TemplateItemType.CLOSING;

  r: string;
}

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
