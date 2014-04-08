module.exports = {
	files: [ 'src/**/*.js' ],
	options: {
		boss: true,
		eqnull: true,
		evil: true,
		laxbreak: true,
		proto: true,
		smarttabs: true,
		strict: true,
		undef: true,
		unused: true,
		'-W018': true,
		'-W041': false,
		globals: {
			clearInterval: true,
			define: true,
			document: true,
			Element: true,
			module: true,
			require: true,
			setInterval: true,
			setTimeout: true,
			window: true
		}
	}
};
