import Ractive$toHTML from './prototype/toHTML';
import { RactiveInternal } from './RactiveInternal';

export class Ractive extends RactiveInternal {
  static readonly VERSION = '';

  /** When true, causes Ractive to emit warnings. Defaults to true. */
  static DEBUG: boolean;

  /**
   * Returns a chunk of HTML representing the current state of the instance.
   * This is most useful when you're using Ractive in node.js, as it allows
   * you to serve fully-rendered pages (good for SEO and initial pageload performance) to the client.
   */
  toHTML = Ractive$toHTML;

  [key: string]: any;
}
