export default {
	missingParser:
		'Missing Ractive.parse - cannot parse template. Either preparse or use the version that includes the parser',

	mergeComparisonFail:
		'Merge operation: comparison failed. Falling back to identity checking',

	noComponentEventArguments:
		'Components currently only support simple events - you cannot include arguments. Sorry!',

	noTemplateForPartial:
		'Could not find template for partial "{name}"',

	noNestedPartials:
		'Partials ({{>{name}}}) cannot contain nested inline partials',

	evaluationError:
		'Error evaluating "{uniqueString}": {err}',

	badArguments:
		'Bad arguments "{arguments}". I\'m not allowed to argue unless you\'ve paid.',

	failedComputation:
		'Failed to compute "{key}": {err}',

	missingPlugin:
		'Missing "{name}" {plugin} plugin. You may need to download a {plugin} via http://docs.ractivejs.org/latest/plugins#{plugin}s',

	badRadioInputBinding:
		'A radio input can have two-way binding on its name attribute, or its checked attribute - not both',

	noRegistryFunctionReturn:
		'A function was specified for "{name}" {registry}, but no {registry} was returned',

	defaultElSpecified:
		'The <{name}/> component has a default `el` property; it has been disregarded'
};
