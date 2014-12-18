// Error messages that are used (or could be) in multiple places
export var badArguments = 'Bad arguments';
export var noRegistryFunctionReturn = 'A function was specified for "%s" %s, but no %s was returned';
export var missingPlugin = ( name, type ) => `Missing "${name}" ${type} plugin. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#${type}s`;