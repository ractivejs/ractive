import { default as templateConfigurator } from '../config/custom/template';
import { createDocumentFragment } from '../../utils/dom';
import Fragment from '../../view/Fragment';

// TODO should resetTemplate be asynchronous? i.e. should it be a case
// of outro, update template, intro? I reckon probably not, since that
// could be achieved with unrender-resetTemplate-render. Also, it should
// conceptually be similar to resetPartial, which couldn't be async

export default function Ractive$resetTemplate ( template ) {
	templateConfigurator.init( null, this, { template });

	const transitionsEnabled = this.transitionsEnabled;
	this.transitionsEnabled = false;

	// Is this is a component, we need to set the `shouldDestroy`
	// flag, otherwise it will assume by default that a parent node
	// will be detached, and therefore it doesn't need to bother
	// detaching its own nodes
	const component = this.component;
	if ( component ) component.shouldDestroy = true;
	this.unrender();
	if ( component ) component.shouldDestroy = false;

	// remove existing fragment and create new one
	this.fragment.unbind().unrender( true );

	this.fragment = new Fragment({
		template: this.template,
		root: this,
		owner: this
	});

	const docFrag = createDocumentFragment();
	this.fragment.bind( this.viewmodel ).render( docFrag );
	this.el.insertBefore( docFrag, this.anchor );

	this.transitionsEnabled = transitionsEnabled;
}
