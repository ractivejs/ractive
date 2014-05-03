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
			]
		}
	}
};
