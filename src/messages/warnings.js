export const INSTANCE_CSS_UNSUPPORTED = `The css option is currently not supported on a per-instance basis and will be discarded:

new Ractive({
	...
	css: '/* your css */',
	...
})

Instead, we recommend instantiating from a component definition with a css option:

const Component = Ractive.extend({
	...
	css: '/* your css */',
	...
});

const componentInstance = new Component({ ... })
`;

export const DEBUG_ENABLED =  `You're running Ractive %s in debug mode

Messages (i.e.: handled errors, debugging info) will be printed to the console to help you fix problems and optimise your application.

To disable debug mode, add this line at the start of your app:

	Ractive.DEBUG = /unminified/.test( _ => {/*unminified*/} );

Get help and support:

	http://docs.ractivejs.org
	http://stackoverflow.com/questions/tagged/ractivejs
	http://groups.google.com/forum/#!forum/ractive-js
	http://twitter.com/ractivejs

Found a bug? Requesting a feature? Raise an issue:

	https://github.com/ractivejs/ractive/issues

`;
