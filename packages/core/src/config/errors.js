// Error messages that are used (or could be) in multiple places
export const badArguments = 'Bad arguments';
export const noRegistryFunctionReturn = 'A function was specified for "%s" %s, but no %s was returned';
export const missingPlugin = ( name, type ) => `Missing "${name}" ${type} plugin. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#${type}s`;
