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

export const DEBUG_WELCOME = `Hi! You're using Ractive %s

Get help and support:
	http://docs.ractivejs.org
	http://stackoverflow.com/questions/tagged/ractivejs
	http://groups.google.com/forum/#!forum/ractive-js
	http://twitter.com/ractivejs

Found a bug? Requesting a feature? Raise an issue:
	https://github.com/ractivejs/ractive/issues
`;

export const DEBUG_ENABLED =  `Debug mode is enabled. Ractive will log debugging info and handled errors.

To disable debug mode, add this line at the start of your app:

	// Disable
	Ractive.DEBUG = false;

	// Disable when minified
	Ractive.DEBUG = /unminified/.test( _ => {/*unminified*/} );
`;

export const PROMISE_DEBUG_ENABLED = `Promise debug mode is enabled. Ractive will log unhandled Promise rejections.

To disable promise debugging, add this line at the start of your app:

	// Disable
	Ractive.DEBUG_PROMISES = false;

	// Disable when minified
	Ractive.DEBUG_PROMISES = /unminified/.test( _ => {/*unminified*/} );
`;
