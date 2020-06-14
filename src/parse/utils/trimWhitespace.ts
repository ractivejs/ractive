import { lastItem } from 'utils/array';
import { isString } from 'utils/is';

// type TrimWhiteSpaceTemplateItem =
//   | AliasTemplateItem
//   | AnchorTemplateItem
//   | NoDelegationFlagDirectiveTemplateItem
//   | DecoratorDirectiveTemplateItem
//   | PartialMustacheTemplateItem
//   | EventDirectiveTemplateItem
//   | TripleMustacheTemplateItem
//   | BindingFlagDirectiveTemplateItem
//   | GenericAttributeTemplateItem
//   | InterpolatorTemplateItem
//   | SectionMustacheTemplateItem
//   | ElementTemplateItem;

export default function trimWhiteSpace(
  items: unknown[],
  leadingPattern: RegExp,
  trailingPattern: RegExp
): void {
  let item: unknown;

  if (leadingPattern) {
    item = items[0];
    if (isString(item)) {
      item = item.replace(leadingPattern, '');

      if (!item) {
        items.shift();
      } else {
        items[0] = item;
      }
    }
  }

  if (trailingPattern) {
    item = lastItem(items);
    if (isString(item)) {
      item = item.replace(trailingPattern, '');

      if (!item) {
        items.pop();
      } else {
        items[items.length - 1] = item;
      }
    }
  }
}
