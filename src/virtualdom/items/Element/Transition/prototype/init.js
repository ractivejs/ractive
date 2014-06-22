import log from 'utils/log';
import config from 'config/config';
import circular from 'circular';

var Fragment, getValueOptions = {}; // TODO what are the options?

circular.push( function () {
	Fragment = circular.Fragment;
});

export default function Transition$init ( element, template ) {
	var t = this, ractive, name, fragment;

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
		fragment.unbind();
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
		fragment.unbind();
	}

	t._fn = config.registries.transitions.find( ractive, name );

	if ( !t._fn ) {

		log.error({
			debug: ractive.debug,
			message: 'missingPlugin',
			args: {
				plugin: 'transition',
				name: name
			}
		})

		return;
	}
}
