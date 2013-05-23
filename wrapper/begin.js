(function ( global ) {

'use strict';

var Ractive,

proto = {},

// properties of the public Ractive object
adaptors = {},
eventDefinitions = {},
easing,
extend,
interpolate,
interpolators,


// internal utils
splitKeypath,
isArray,
isObject,
isNumeric,
isEqual,
getEl,


// internally used caches
keypathCache = {},


// internally used constructors
DomFragment,
TextFragment,
Evaluator,
Animation,


// internally used regexes
leadingWhitespace = /^\s+/,
trailingWhitespace = /\s+$/,


// other bits and pieces
initMustache,
updateMustache,
resolveMustache,
evaluateMustache,

initFragment,
updateSection,

animationCollection,


// array modification
registerKeypathToArray,
unregisterKeypathFromArray,


// tokenizer
getToken,

tokens = {},
expr = {},
stubs = {},

stripCommentTokens,
stripHtmlComments,
stripStandalones,


// constants
TEXT              = 1,
INTERPOLATOR      = 2,
TRIPLE            = 3,
SECTION           = 4,
INVERTED          = 5,
CLOSING           = 6,
ELEMENT           = 7,
PARTIAL           = 8,
COMMENT           = 9,
DELIMCHANGE       = 10,
MUSTACHE          = 11,
TAG               = 12,
ATTR_VALUE_TOKEN  = 13,
EXPRESSION        = 14,

NUMBER_LITERAL    = 20,
STRING_LITERAL    = 21,
ARRAY_LITERAL     = 22,
OBJECT_LITERAL    = 23,
BOOLEAN_LITERAL   = 24,
LITERAL           = 25,
GLOBAL            = 26,


REFERENCE         = 30,
REFINEMENT        = 31,
MEMBER            = 32,
PREFIX_OPERATOR   = 33,
BRACKETED         = 34,
CONDITIONAL       = 35,
INFIX_OPERATOR    = 36,

INVOCATION        = 40,


// namespaces
namespaces = {
	html:   'http://www.w3.org/1999/xhtml',
	mathml: 'http://www.w3.org/1998/Math/MathML',
	svg:    'http://www.w3.org/2000/svg',
	xlink:  'http://www.w3.org/1999/xlink',
	xml:    'http://www.w3.org/XML/1998/namespace',
	xmlns:  'http://www.w3.org/2000/xmlns/'
};