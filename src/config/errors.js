export var badArguments = 'Bad arguments';
export var noRegistryFunctionReturn = 'A function was specified for "%s" %s, but no %s was returned';
export var missingPlugin = ( name, type ) => `Missing "${name}" ${type} plugin. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#${type}s`;

export default {
	missingParser:
		'Missing Ractive.parse - cannot parse template. Either preparse or use the version that includes the parser',

	mergeComparisonFail:
		'Merge operation: comparison failed. Falling back to identity checking',

	evaluationError:
		'Error evaluating "{uniqueString}": {err}',

	badArguments:
		'Bad arguments "{arguments}". I\'m not allowed to argue unless you\'ve paid.',

	missingPlugin:
		'Missing "{name}" {plugin} plugin. You may need to download a {plugin} via http://docs.ractivejs.org/latest/plugins#{plugin}s',

	noRegistryFunctionReturn:
		'A function was specified for "{name}" {registry}, but no {registry} was returned',

	noElementProxyEventWildcards:
		'Only component proxy-events may contain "*" wildcards, <{element} on-{event}/> is not valid.',

	computedCannotMapTo:
		'Computed property "{key}" cannot be mapped to "{other}" because {reason}.',

	notUsed:
		'prevents forgetting trailing "," in cut and paste of previous line :)'
};
