getFragmentStubFromTokens = function ( tokens, options, preserveWhitespace ) {
	var parser, stub;

	parser = {
		pos: 0,
		tokens: tokens || [],
		next: function () {
			return parser.tokens[ parser.pos ];
		},
		options: options
	};

	stub = new FragmentStub( parser, preserveWhitespace );

	return stub;
};