import log from 'utils/log/log';
import config from 'Ractive/config/config';
import Fragment from 'virtualdom/Fragment';

var getValueOptions = {}; // TODO what are the options?

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

		this.params = fragment.getValue( getValueOptions );
		fragment.unbind();
	}

	this._fn = config.registries.transitions.find( ractive, name );

	if ( !this._fn ) {
		log.error({
			debug: ractive.debug,
			message: 'missingPlugin',
			args: {
				plugin: 'transition',
				name: name
			}
		});
	}
}
