import warn from 'utils/warn';

export default function initBinding ( binding, element, name ) {
	var interpolator;

	binding.element = element;
	binding.root = element.root;
	binding.attribute = element.attributes[ name || 'value' ];

	interpolator = binding.attribute.interpolator;

	if ( interpolator.keypath && interpolator.keypath.substr === '${' ) {
		warn( 'Two-way binding does not work with expressions: ' + interpolator.keypath );
		return false;
	}

	// A mustache may be *ambiguous*. Let's say we were given
	// `value="{{bar}}"`. If the context was `foo`, and `foo.bar`
	// *wasn't* `undefined`, the keypath would be `foo.bar`.
	// Then, any user input would result in `foo.bar` being updated.
	//
	// If, however, `foo.bar` *was* undefined, and so was `bar`, we would be
	// left with an unresolved partial keypath - so we are forced to make an
	// assumption. That assumption is that the input in question should
	// be forced to resolve to `bar`, and any user input would affect `bar`
	// and not `foo.bar`.
	//
	// Did that make any sense? No? Oh. Sorry. Well the moral of the story is
	// be explicit when using two-way data-binding about what keypath you're
	// updating. Using it in lists is probably a recipe for confusion...
	if ( !interpolator.keypath ) {
		// TODO: What about rx?
		interpolator.resolve( interpolator.ref );
	}

	binding.keypath = binding.attribute.interpolator.keypath;
}
