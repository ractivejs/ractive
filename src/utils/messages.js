import { top } from '../config/environment';
/*
 m: the message - {0}, {1}, etc will be replaced by passed arguments
 e: if truthy, defaults the message to an error - defaults to false
 w: this message is a warning - defaults to true
 o: this message should only be issued once - defaults to false
 d: only if Ractive.DEBUG - defaults to true

 The error flag is checked first, so if true and not overridden by the caller, an error _will_ be thrown.
 */
let messages;

messages = {
	UNKNOWN_MESSAGE: {
		m: 'Unknown message id "{0}"'
	},

	ALREADY_UNRENDERED: {
		m: 'ractive.unrender() was called on a Ractive instance that was not rendered'
	},
	AMBIGUOUS_BINDING: {
		m: 'The {0} being used for two-way binding is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity',
		o: 1
	},
	AMBIGUOUS_MAPPING: {
		m: 'The {0}="{1}" mapping is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity',
		o: 1
	},
	BAD_ARGUMENTS: {
		m: 'Bad arguments, expected a {0} - got {1}',
		e: 1
	},
	COMPONENT_EL: {
		m: 'The <{0}> component has a default "el" property; it has been disregarded'
	},
	COMPUTE_FAIL: {
		m: 'Failed to compute {0}: {1}'
	},
	COMPUTED_GET: {
		m: '`{0}` computation must have a `get()` method',
		e: 1
	},
	DATA_FUNCTION_OBJECT: {
		m: 'Data function must return an object',
		e: 1
	},
	DATA_FUNCTION_POJO: {
		m: 'Data function returned something other than a plain JavaScript object. This might work, but is strongly discouraged',
		o: 1
	},
	DATA_OBJECT: {
		m: 'data option must be an object or a function, `{0}` is not valid',
		e: 1
	},
	DATA_OBJECT_EXTEND: {
		m: `Passing a \`data\` option with object and array properties to Ractive.extend() is discouraged, as mutating them is likely to cause bugs. Consider using a data function instead:

  // this...
  data: function () {
	return {
	  myObject: {}
	};
  })

  // instead of this:
  data: {
	myObject: {}
  }`
	},
	DATA_POJO: {
		m: 'If supplied, options.data should be a plain JavaScript object - using a non-POJO as the root object may work, but is discouraged'
	},
	ENHANCE_APPEND: {
		m: 'Cannot use append and enhance at the same time',
		e: 1
	},
	INSTANCE_CSS: {
		m: `The css option is currently not supported on a per-instance basis and will be discarded. Instead, we recommend instantiating from a component definition with a css option.

const Component = Ractive.extend({
	...
	css: '/* your css */',
	...
});

const componentInstance = new Component({ ... })`
	},
	MISSING_COMPUTE_PARSER: {
		m: `Either use:

	Ractive.parse.computedStrings( component.computed )

at build time to pre-convert the strings to functions, or use functions instead of strings in computed properties.`,
		e: 1
	},
	MISSING_PARTIAL: {
		m: 'Could not find template for partial "{0}"',
		o: 1
	},
	MISSING_PLUGIN: {
		m: 'Missing "{0}" {1} plugin. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#{1}s',
		e: 1
	},
	MISSING_TEARDOWN: {
		m: 'The "{0}" {1} must return an object with a teardown method',
		e: 1
	},
	MISSING_TEMPLATE_PARSER: {
		m: 'Missing Ractive.parse - cannot parse {0}. Either preparse or use a ractive runtime source that includes the parser.',
		e: 1
	},
	NO_EVENT_WILDCARD: {
		m: 'Only component proxy-events may contain "*" wildcards, <{0} on-{1}="..."/> is not valid',
		e: 1
	},
	NO_NESTED_PARTIALS: {
		m: 'Partials ({{>{0}}}) cannot contain nested inline partials'
	},
	NO_PROPERTY_SUPPORT: {
		m: 'Getters and setters (magic mode) are not supported in this browser',
		e: 1
	},
	NO_REGISTRY_FUNCTION_RETURN: {
		m: 'A function was specified for "{0}" {1}, but no {1} was returned'
	},
	NO_TRANSITION_NODE: {
		m: 'No node was supplied for transition {0}',
		e: 1
	},
	NON_FUNCTION_OPTION: {
		m: '{0} is a Ractive option that does not expect a function and will be ignored'
	},
	PARTIAL_PARSE_FAIL: {
		m: 'Could not parse partial from expression "{0}"\n{1}'
	},
	PROMISE_DEBUG: {
		m: 'Promise debugging is enabled, to help solve errors that happen asynchronously. Some browsers will log unhandled promise rejections, in which case you can safely disable promise debugging:\n  Ractive.DEBUG_PROMISES = false;',
		o: 1
	},
	RADIO_BIND_NAME_CHECKED: {
		m: 'A radio input can have two-way binding on its name attribute, or its checked attribute - not both'
	},
	READ_ONLY_BINDING: {
		m: 'Cannot use two-way binding on <{0}> element: "{1}" is read-only. To suppress this warning use <{0} twoway="false"...>',
		o: 1
	},
	RENDER_ERROR: {
		m: 'An error ocurred during rendering'
	},
	TRANSITION_WAT: {
		m: 'Something very strange happened with transitions. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!'
	},
	USE_AFTER_TEARDOWN: {
		m: 'ractive.{0}() was called on a Ractive instance that was already torn down'
	},
	WELCOME_MESSAGE: {
		m: `You're running Ractive <@version@> in debug mode - messages will be printed to the console to help you fix problems and optimise your application.

To disable debug mode, add this line at the start of your app:
  Ractive.DEBUG = false;

To disable debug mode when your app is minified, add this snippet:
  Ractive.DEBUG = /unminified/.test(function(){/*unminified*/});

Get help and support:
  http://docs.ractivejs.org
  http://stackoverflow.com/questions/tagged/ractivejs
  http://groups.google.com/forum/#!forum/ractive-js
  http://twitter.com/ractivejs

Found a bug? Raise an issue:
  https://github.com/ractivejs/ractive/issues

`
	},
};

export default messages;
