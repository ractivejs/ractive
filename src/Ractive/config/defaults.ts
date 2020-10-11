import type { ParseDelimiters } from 'types/Parse';
import { create } from 'utils/object';

const defaults = {
  // render placement:
  el: void 0,
  append: false,
  delegate: true,
  enhance: false,

  // template:
  template: null,

  // parse:
  allowExpressions: true,
  delimiters: ['{{', '}}'] as ParseDelimiters,
  tripleDelimiters: ['{{{', '}}}'] as ParseDelimiters,
  staticDelimiters: ['[[', ']]'] as ParseDelimiters,
  staticTripleDelimiters: ['[[[', ']]]'] as ParseDelimiters,
  csp: true,
  interpolate: false,
  preserveWhitespace: false,
  sanitize: false,
  stripComments: true,
  contextLines: 0,

  // data & binding:
  data: create(null),
  helpers: create(null),
  computed: create(null),
  syncComputedChildren: false,
  resolveInstanceMembers: false,
  warnAboutAmbiguity: false,
  adapt: [],
  isolated: true,
  twoway: true,
  lazy: false,

  // transitions:
  noIntro: false,
  noOutro: false,
  transitionsEnabled: true,
  complete: void 0,
  nestedTransitions: true,

  // css:
  css: null,
  noCSSTransform: false
};

export default defaults;
