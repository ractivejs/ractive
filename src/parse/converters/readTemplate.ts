import { TEMPLATE_VERSION } from 'config/template';
import { READERS, PARTIAL_READERS, StandardParser } from 'parse/_parse';
import cleanup from 'parse/utils/cleanup';
import { create } from 'utils/object';

import type {
  TemplateModel,
  InlinePartialDefinitionTemplateItem,
  PartialRegistryTemplateItem
} from './templateItemDefinitions';

export default function readTemplate(parser: StandardParser): TemplateModel {
  const fragment = [];

  const partials: PartialRegistryTemplateItem = create(null);
  let hasPartials = false;

  const preserveWhitespace = parser.preserveWhitespace;

  while (parser.pos < parser.str.length) {
    const pos = parser.pos;
    let item;
    let partial: InlinePartialDefinitionTemplateItem;

    if ((partial = parser.read(PARTIAL_READERS))) {
      if (partials[partial.n]) {
        parser.pos = pos;
        parser.error('Duplicated partial definition');
      }

      cleanup(
        partial.f,
        parser.stripComments,
        preserveWhitespace,
        !preserveWhitespace,
        !preserveWhitespace,
        parser.whiteSpaceElements
      );

      partials[partial.n] = partial.f;
      hasPartials = true;
    } else if ((item = parser.read(READERS))) {
      fragment.push(item);
    } else {
      parser.error('Unexpected template content');
    }
  }

  const result: TemplateModel = {
    v: TEMPLATE_VERSION,
    t: fragment
  };

  if (hasPartials) {
    result.p = partials;
  }

  return result;
}
