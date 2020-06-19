import TemplateItemType from 'config/types';

import {
  SectionMustacheTemplateItem,
  InterpolatorTemplateItem,
  TripleMustacheTemplateItem,
  PartialMustacheTemplateItem
} from '../mustache/mustacheDefinitions';
import { ExpressionFunctionTemplateItem } from '../templateItemDefinitions';

export interface ClosingTagTemplateItem {
  t: TemplateItemType.CLOSING_TAG;
  e: string;
}

export type BindingFlagDirectiveFunction =
  | string
  | (SectionMustacheTemplateItem | InterpolatorTemplateItem)[];

export type BindingFlagDirectiveValue = 'l' | 't';

export interface BindingFlagDirectiveTemplateItem {
  t: TemplateItemType.BINDING_FLAG;

  /**
   * l-> lazy
   * t -> twoway
   */
  v: BindingFlagDirectiveValue;

  f?: BindingFlagDirectiveFunction;
}

export interface NoDelegationFlagDirectiveTemplateItem {
  t: TemplateItemType.DELEGATE_FLAG;
}

export interface ExcludedElementTemplateItem {
  exclude: true;
}

export interface DecoratorDirectiveTemplateItem {
  t: TemplateItemType.DECORATOR;

  /** Name of the decorator */
  n: string;

  f?: ExpressionFunctionTemplateItem;
}

export enum TransitionTrigger {
  INTRO_OUTRO = 't0',
  INTRO = 't1',
  OUTRO = 't2'
}

export interface TransitionDirectiveTemplateItem {
  t: TemplateItemType.TRANSITION;

  /** Name of the transition */
  n: string;

  /** Transition trigger (intro / outro / intro & outro) */
  v: TransitionTrigger;

  f?: ExpressionFunctionTemplateItem;
}

export interface EventDirectiveTemplateItem {
  t: TemplateItemType.EVENT;

  n: string[];

  f: ExpressionFunctionTemplateItem | string;

  a?: ExpressionFunctionTemplateItem;
}

export type GenericAttributeTemplateValue =
  | (
      | string
      | InterpolatorTemplateItem
      | TripleMustacheTemplateItem
      | SectionMustacheTemplateItem
      | PartialMustacheTemplateItem
    )[]
  | number
  | string;

export interface GenericAttributeTemplateItem {
  t: TemplateItemType.ATTRIBUTE;

  /** attribute name */
  n: string;

  f?: GenericAttributeTemplateValue;

  /** todo what is this? */
  g?: number;
}

export type AttributeWithArguments =
  | DecoratorDirectiveTemplateItem
  | TransitionDirectiveTemplateItem
  | EventDirectiveTemplateItem
  | GenericAttributeTemplateItem;

/** Output of {@link readAttributesOrDirective} */
export type AttributesOrDirectiveTemplateItem =
  | BindingFlagDirectiveTemplateItem
  | NoDelegationFlagDirectiveTemplateItem
  | ExcludedElementTemplateItem
  | DecoratorDirectiveTemplateItem
  | TransitionDirectiveTemplateItem
  | EventDirectiveTemplateItem
  | GenericAttributeTemplateItem;
