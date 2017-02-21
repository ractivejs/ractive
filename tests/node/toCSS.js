const { module, test } = QUnit;

export default function(){

	module( 'ractive.toCSS()' );

	test( 'should render CSS with a single component instance', t => {

		const Component = Ractive.extend( {
			template: '<div></div>',
			css: '\n\t\t\t\t.green {\n\t\t\t\t\tcolor: green\n\t\t\t\t}\n\t\t'
		} );

		const app = new Component( {} );

		const cssId = Component.prototype.cssId;
		const css = app.toCSS();

		// Look for the selector
		t.ok( !!~css.indexOf( '.green[data-ractive-css~="{' + cssId + '}"], [data-ractive-css~="{' + cssId + '}"] .green', '.green selector for ' + cssId + ' should exist' ) );

		app.teardown();
	} );

	test( 'should render CSS with nested component instances', t => {

		const GrandChildComponent = Ractive.extend( {
			template: '<div></div>',
			css: '\n\t\t\t\t.green {\n\t\t\t\t\tcolor: green;\n\t\t\t\t}\n\t\t'
		} );

		const ChildComponent = Ractive.extend( {
			template: '\n\t\t\t\t<div></div>\n\t\t\t\t<GrandChildComponent />\n\t\t\t',
			css: '\n\t\t\t\t.red {\n\t\t\t\t\tcolor: red;\n\t\t\t\t}\n\t\t',
			components: {
				GrandChildComponent
			}
		} );

		const ParentComponent = Ractive.extend( {
			template: '\n\t\t\t\t<div></div>\n\t\t\t\t<ChildComponent />\n\t\t\t',
			css: '\n\t\t\t\t.blue{\n\t\t\t\t\tcolor: blue;\n\t\t\t\t}\n\t\t\t',
			components: {
				ChildComponent
			}
		} );

		const app = new ParentComponent( {} );

		const css = app.toCSS();
		const grandChildCssId = GrandChildComponent.prototype.cssId;
		const childCssId = ChildComponent.prototype.cssId;
		const parentCssId = ParentComponent.prototype.cssId;

		// Look for the selectors
		t.ok( !!~css.indexOf( '.green[data-ractive-css~="{' + grandChildCssId + '}"], [data-ractive-css~="{' + grandChildCssId + '}"] .green' ), '.green selector for ' + grandChildCssId + ' should exist' );

		t.ok( !!~css.indexOf( '.red[data-ractive-css~="{' + childCssId + '}"], [data-ractive-css~="{' + childCssId + '}"] .red' ), '.red selector for ' + childCssId + ' should exist' );

		t.ok( !!~css.indexOf( '.blue[data-ractive-css~="{' + parentCssId + '}"], [data-ractive-css~="{' + parentCssId + '}"] .blue' ), '.blue selector for ' + parentCssId + ' should exist' );

		app.teardown();
	} );

	test( 'should NEVER render CSS with a Ractive instance', t => {

		const app = new Ractive( {
			template: '<div></div>',
			css: '\n\t\t\t\t.green {\n\t\t\t\t\tcolor: green\n\t\t\t\t}\n\t\t\t'
		} );

		const css = app.toCSS();

		t.ok( !~css.indexOf( '.green[data-ractive-css~="{' + app.cssId + '}"], [data-ractive-css~="{' + app.cssId + '}"] .green', '.green selector for ' + app.cssId + ' should NEVER exist' ) );

		app.teardown();
	} );

}
