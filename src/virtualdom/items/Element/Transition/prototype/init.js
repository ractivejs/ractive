import warn from 'utils/warn';

import circular from 'circular';

var Fragment, getValueOptions = {}; // TODO what are the options?

circular.push( function () {
	Fragment = circular.Fragment;
});

export default function Transition$init ( element, template ) {
	var t = this, ractive, name, fragment, errorMessage;

	t.element = element;
	t.root = ractive = element.root;

	name = template.n || template;

	if ( typeof name !== 'string' ) {
		fragment = new Fragment({
			template: name,
			root:     ractive,
			owner:    element
		});

		name = fragment.toString();
		fragment.teardown();
	}

	t.name = name;

	if ( template.a ) {
		t.params = template.a;
	}

	else if ( template.d ) {
		// TODO is there a way to interpret dynamic arguments without all the
		// 'dependency thrashing'?
		fragment = new Fragment({
			template: template.d,
			root:     ractive,
			owner:    element
		});

		t.params = fragment.getValue( getValueOptions );
		fragment.teardown();
	}

	t._fn = ractive.transitions[ name ];
	if ( !t._fn ) {
		errorMessage = 'Missing "' + name + '" transition. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#transitions';

		if ( ractive.debug ) {
			throw new Error( errorMessage );
		} else {
			warn( errorMessage );
		}

		return;
	}
}
