import circular from 'circular';
import fireEvent from 'Ractive/prototype/shared/fireEvent';

var Fragment, getValueOptions = { args: true };

circular.push( function () {
	Fragment = circular.Fragment;
});

export default function EventHandler$init ( element, name, template ) {
	var action;

	this.element = element;
	this.root = element.root;
	this.name = name;

	this.proxies = [];

	// Get action ('foo' in 'on-click='foo')
	action = template.n || template;
	if ( typeof action !== 'string' ) {
		action = new Fragment({
			template: action,
			root: this.root,
			owner: this
		});
	}

	this.action = action;

	// Get parameters
	if ( template.d ) {
		this.dynamicParams = new Fragment({
			template: template.d,
			root: this.root,
			owner: this.element
		});

		this.fire = fireEventWithDynamicParams;
	} else if ( template.a ) {
		this.params = template.a;
		this.fire = fireEventWithParams;
	}
}

function fireEventWithParams ( event ) {
	fireEvent( this.root, this.getAction(), { event: event, args: this.params } );
}

function fireEventWithDynamicParams ( event ) {
	var args = this.dynamicParams.getValue( getValueOptions );

	// need to strip [] from ends if a string!
	if ( typeof args === 'string' ) {
		args = args.substr( 1, args.length - 2 );
	}

	fireEvent( this.root, this.getAction(), { event: event, args: args } );
}
