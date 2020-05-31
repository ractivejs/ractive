import TemplateItemType from 'config/types';
import { StandardParser } from 'parse/_parse';
import { CommentTemplateItem } from './templateItemDefinitions';

const OPEN_COMMENT = '<!--';
const CLOSE_COMMENT = '-->';

export default function readHtmlComment(parser: StandardParser): CommentTemplateItem {
  const start = parser.pos;

  if (parser.textOnlyMode || !parser.matchString(OPEN_COMMENT)) {
    return null;
  }

  const remaining = parser.remaining();
  const endIndex = remaining.indexOf(CLOSE_COMMENT);

  if (endIndex === -1) {
    parser.error("Illegal HTML - expected closing comment sequence ('-->')");
  }

  const content = remaining.substr(0, endIndex);
  parser.pos += endIndex + 3;

  const comment: CommentTemplateItem = {
    t: TemplateItemType.COMMENT,
    c: content
  };

  if (parser.includeLinePositions) {
    comment.q = parser.getLinePos(start);
  }

  return comment;
}
