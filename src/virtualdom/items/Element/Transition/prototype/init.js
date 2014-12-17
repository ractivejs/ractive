import { warnOnce } from 'utils/log';
import { missingPlugin } from 'config/errors';
import Fragment from 'virtualdom/Fragment';
import { findInViewHierarchy } from 'shared/registry';

export default function Transition$init ( element, template, isIntro ) {
	var ractive, name, fragment;

	this.element = element;
	this.root = ractive = element.root;
	this.isIntro = isIntro;

	name = template.n || template;

	if ( typeof name !== 'string' ) {
		fragment = new Fragment({
			template: name,
			root:     ractive,
			owner:    element
		});

		name = fragment.toString();
		fragment.unbind();

		if ( name === '' ) {
			// empty string okay, just no transition
			return;
		}
	}

	this.name = name;

	if ( template.a ) {
		this.params = template.a;
	}

	else if ( template.d ) {
		// TODO is there a way to interpret dynamic arguments without all the
		// 'dependency thrashing'?
		fragment = new Fragment({
			template: template.d,
			root:     ractive,
			owner:    element
		});

		this.params = fragment.getArgsList();
		fragment.unbind();
	}

	this._fn = findInViewHierarchy( 'transitions', ractive, name );

	if ( !this._fn ) {
		warnOnce( missingPlugin( name, 'transition' ) );
	}
}
