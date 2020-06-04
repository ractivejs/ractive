enum TemplateItemType {
  TEXT = 1,
  INTERPOLATOR = 2,
  TRIPLE = 3,
  SECTION = 4,
  INVERTED = 5,
  CLOSING = 6,
  ELEMENT = 7,
  PARTIAL = 8,
  COMMENT = 9,
  DELIMCHANGE = 10,
  ANCHOR = 11,
  ATTRIBUTE = 13,
  CLOSING_TAG = 14,
  COMPONENT = 15,
  YIELDER = 16,
  INLINE_PARTIAL = 17,
  DOCTYPE = 18,
  ALIAS = 19,

  AWAIT = 55,

  NUMBER_LITERAL = 20,
  STRING_LITERAL = 21,
  ARRAY_LITERAL = 22,
  OBJECT_LITERAL = 23,
  BOOLEAN_LITERAL = 24,
  REGEXP_LITERAL = 25,

  GLOBAL = 26,
  KEY_VALUE_PAIR = 27,

  REFERENCE = 30,
  REFINEMENT = 31,
  MEMBER = 32,
  PREFIX_OPERATOR = 33,
  BRACKETED = 34,
  CONDITIONAL = 35,
  INFIX_OPERATOR = 36,

  INVOCATION = 40,

  SECTION_IF = 50,
  SECTION_UNLESS = 51,
  SECTION_EACH = 52,
  SECTION_WITH = 53,
  SECTION_IF_WITH = 54,

  ELSE = 60,
  ELSEIF = 61,
  THEN = 62,
  CATCH = 63,

  EVENT = 70,
  DECORATOR = 71,
  TRANSITION = 72,
  BINDING_FLAG = 73,
  DELEGATE_FLAG = 74
}

export default TemplateItemType;

// todo remove const and use enum

export const TEXT = 1;
export const INTERPOLATOR = 2;
export const TRIPLE = 3;
export const SECTION = 4;
export const INVERTED = 5;
// export const CLOSING = 6;
export const ELEMENT = 7;
export const PARTIAL = 8;
export const COMMENT = 9;
export const DELIMCHANGE = 10;
export const ANCHOR = 11;
export const ATTRIBUTE = 13;
export const CLOSING_TAG = 14;
export const COMPONENT = 15;
export const YIELDER = 16;
export const INLINE_PARTIAL = 17;
export const DOCTYPE = 18;
export const ALIAS = 19;

export const AWAIT = 55;

// export const NUMBER_LITERAL = 20;
// export const STRING_LITERAL = 21;
// export const ARRAY_LITERAL = 22;
export const OBJECT_LITERAL = 23;
// export const BOOLEAN_LITERAL = 24;
// export const REGEXP_LITERAL = 25;

// export const GLOBAL = 26;
// export const KEY_VALUE_PAIR = 27;

export const REFERENCE = 30;
// export const REFINEMENT = 31;
// export const MEMBER = 32;
// export const PREFIX_OPERATOR = 33;
// export const BRACKETED = 34;
// export const CONDITIONAL = 35;
// export const INFIX_OPERATOR = 36;

// export const INVOCATION = 40;

export const SECTION_IF = 50;
export const SECTION_UNLESS = 51;
export const SECTION_EACH = 52;
export const SECTION_WITH = 53;
export const SECTION_IF_WITH = 54;

export const ELSE = 60;
// export const ELSEIF = 61;
export const THEN = 62;
export const CATCH = 63;

export const EVENT = 70;
export const DECORATOR = 71;
export const TRANSITION = 72;
export const BINDING_FLAG = 73;
export const DELEGATE_FLAG = 74;
