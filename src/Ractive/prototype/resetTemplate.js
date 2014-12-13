import { default as templateConfigurator } from 'Ractive/config/custom/template/template';
import Fragment from 'virtualdom/Fragment';

// TODO should resetTemplate be asynchronous? i.e. should it be a case
// of outro, update template, intro? I reckon probably not, since that
// could be achieved with unrender-resetTemplate-render. Also, it should
// conceptually be similar to resetPartial, which couldn't be async

export default function Ractive$resetTemplate ( template ) {
	var transitionsEnabled, component;

	templateConfigurator.init( null, this, { template: template });

	transitionsEnabled = this.transitionsEnabled;
	this.transitionsEnabled = false;

	// Is this is a component, we need to set the `shouldDestroy`
	// flag, otherwise it will assume by default that a parent node
	// will be detached, and therefore it doesn't need to bother
	// detaching its own nodes
	if ( component = this.component ) {
		component.shouldDestroy = true;
	}

	this.unrender();

	if ( component ) {
		component.shouldDestroy = false;
	}

	// remove existing fragment and create new one
	this.fragment.unbind();
	this.fragment = new Fragment({
		template: this.template,
		root: this,
		owner: this
	});

	this.render( this.el, this.anchor );

	this.transitionsEnabled = transitionsEnabled;
}
