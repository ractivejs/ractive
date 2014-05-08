export default function Transition$init ( element, template ) {
	var t = this, ractive, name, fragment, errorMessage;

	this.element = element;
	this.root = ractive = element.root;

	name = template.n || template;

	if ( typeof name !== 'string' ) {
		fragment = new Fragment({
			template: name,
			root:     ractive,
			owner:    owner
		});

		name = fragment.toString();
		fragment.teardown();
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
			owner:    owner
		});

		this.params = fragment.getValue( getValueOptions );
		fragment.teardown();
	}

	this._fn = ractive.transitions[ name ];
	if ( !this._fn ) {
		errorMessage = 'Missing "' + name + '" transition. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#transitions';

		if ( ractive.debug ) {
			throw new Error( errorMessage );
		} else {
			warn( errorMessage );
		}

		return;
	}
}
