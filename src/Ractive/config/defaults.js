import { create } from 'utils/object';

export default {
	// render placement:
	el:                     void 0,
	append:                 false,
	delegate:               true,

	// template:
	template:               null,

	// parse:
	allowExpressions:       true,
	delimiters:             [ '{{', '}}' ],
	tripleDelimiters:       [ '{{{', '}}}' ],
	staticDelimiters:       [ '[[', ']]' ],
	staticTripleDelimiters: [ '[[[', ']]]' ],
	csp:                    true,
	interpolate:            false,
	preserveWhitespace:     false,
	sanitize:               false,
	stripComments:          true,
	contextLines:           0,

	// data & binding:
	data:                   create( null ),
	helpers:                create( null ),
	computed:               create( null ),
	syncComputedChildren:   false,
	resolveInstanceMembers: true,
	warnAboutAmbiguity:     false,
	adapt:                  [],
	isolated:               true,
	twoway:                 true,
	lazy:                   false,

	// transitions:
	noIntro:                false,
	noOutro:                false,
	transitionsEnabled:     true,
	complete:               void 0,
	nestedTransitions:      true,

	// css:
	css:                    null,
	noCssTransform:         false
};
