export default function initialiseMustache ( mustache, options ) {
	mustache.parentFragment = options.parentFragment;
	mustache.template = options.template;
	mustache.index = options.index;

	mustache.model = null;
}
