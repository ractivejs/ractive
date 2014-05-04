module.exports = {
	main: {
		files: {
			src: 'src/**/*.js'
		},
		options: {
			"requireSpaceAfterKeywords": [
				"if",
				"else",
				"for",
				"while",
				"do",
				"switch",
				"return",
				"try",
				"catch"
			],
			"requireSpaceBeforeBlockStatements": true,
			"requireParenthesesAroundIIFE": true,
			"requireSpacesInFunctionExpression": {
				"beforeOpeningRoundBrace": true,
				"beforeOpeningCurlyBrace": true
			},
			"requireMultipleVarDecl": true,
			"requireBlocksOnNewline": true,
			"disallowEmptyBlocks": true,
			"requireSpacesInsideObjectBrackets": "all",
			"requireSpacesInsideArrayBrackets": "all",
			"disallowQuotedKeysInObjects": "allButReserved",
			"requireCommaBeforeLineBreak": true,
			"disallowSpaceAfterPrefixUnaryOperators": ["++", "--", "+", "-", "~", "!"],
			"disallowSpaceBeforePostfixUnaryOperators": ["++", "--"],
			"requireSpaceBeforeBinaryOperators": [
				"+",
				"-",
				"/",
				"*",
				"=",
				"==",
				"===",
				"!=",
				"!=="
			],
			"requireSpaceAfterBinaryOperators": [
				"+",
				"-",
				"/",
				"*",
				"=",
				"==",
				"===",
				"!=",
				"!=="
			],
			"requireCamelCaseOrUpperCaseIdentifiers": true,
			"validateQuoteMarks": { "mark": "'", "escape": true },
			"disallowMixedSpacesAndTabs": "smart",
			"disallowTrailingWhitespace": true,
			"disallowTrailingComma": true,
			"requireLineFeedAtFileEnd": true,
			"requireCapitalizedConstructors": true,
			"disallowYodaConditions": true
		}
	}
};
