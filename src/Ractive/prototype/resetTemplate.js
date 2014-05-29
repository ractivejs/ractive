import config from 'config/configuration';
import Fragment from 'virtualdom/Fragment';

// TODO should resetTemplate be asynchronous? i.e. should it be a case
// of outro, update template, intro? I reckon probably not, since that
// could be achieved with unrender-resetTemplate-render. Also, it should
// conceptually be similar to resetPartial, which couldn't be async

export default function ( template ) {
	var transitionsEnabled

	config.get( 'template' ).init( null, this, { template: template } );

	transitionsEnabled = this.transitionsEnabled;
	this.transitionsEnabled = false;

	this.unrender();

	// remove existing fragment and create new one
	this.fragment.teardown();
	this.fragment = new Fragment({
		template: this.template,
		root: this,
		owner: this
	});

	this.render( this.el, this.anchor );

	this.transitionsEnabled = transitionsEnabled;

}
