import TemplateItemType from 'config/types';
import { StandardParser } from 'parse/_parse';
import { CommentTemplateItem } from '../templateItemDefinitions';

export default function readComment(parser: StandardParser, tag): CommentTemplateItem {
  if (!parser.matchString('!')) {
    return null;
  }

  const index = parser.remaining().indexOf(tag.close);

  if (index !== -1) {
    parser.pos += index + tag.close.length;
    return { t: TemplateItemType.COMMENT };
  }
}
