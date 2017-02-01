QUnit.module( 'ractive.toCSS()' );


QUnit.test( 'should render CSS with a single component instance', function( assert ) {

	var Component = Ractive.extend( {
		template: '<div></div>',
		css: '\n\t\t\t\t.green {\n\t\t\t\t\tcolor: green\n\t\t\t\t}\n\t\t'
	} );

	var app = new Component( {} );

	var cssId = Component.prototype.cssId;
	var css = app.toCSS();

	// Look for the selector
	assert.ok( !!~css.indexOf( '.green[data-ractive-css~="{' + cssId + '}"], [data-ractive-css~="{' + cssId + '}"] .green', '.green selector for ' + cssId + ' should exist' ) );

	app.teardown();
} );

QUnit.test( 'should render CSS with nested component instances', function( assert ) {

	var GrandChildComponent = Ractive.extend( {
		template: '<div></div>',
		css: '\n\t\t\t\t.green {\n\t\t\t\t\tcolor: green;\n\t\t\t\t}\n\t\t'
	} );

	var ChildComponent = Ractive.extend( {
		template: '\n\t\t\t\t<div></div>\n\t\t\t\t<GrandChildComponent />\n\t\t\t',
		css: '\n\t\t\t\t.red {\n\t\t\t\t\tcolor: red;\n\t\t\t\t}\n\t\t',
		components: {
			GrandChildComponent: GrandChildComponent
		}
	} );

	var ParentComponent = Ractive.extend( {
		template: '\n\t\t\t\t<div></div>\n\t\t\t\t<ChildComponent />\n\t\t\t',
		css: '\n\t\t\t\t.blue{\n\t\t\t\t\tcolor: blue;\n\t\t\t\t}\n\t\t\t',
		components: {
			ChildComponent: ChildComponent
		}
	} );

	var app = new ParentComponent( {} );

	var css = app.toCSS();
	var grandChildCssId = GrandChildComponent.prototype.cssId;
	var childCssId = ChildComponent.prototype.cssId;
	var parentCssId = ParentComponent.prototype.cssId;

	// Look for the selectors
	assert.ok( !!~css.indexOf( '.green[data-ractive-css~="{' + grandChildCssId + '}"], [data-ractive-css~="{' + grandChildCssId + '}"] .green' ), '.green selector for ' + grandChildCssId + ' should exist' );

	assert.ok( !!~css.indexOf( '.red[data-ractive-css~="{' + childCssId + '}"], [data-ractive-css~="{' + childCssId + '}"] .red' ), '.red selector for ' + childCssId + ' should exist' );

	assert.ok( !!~css.indexOf( '.blue[data-ractive-css~="{' + parentCssId + '}"], [data-ractive-css~="{' + parentCssId + '}"] .blue' ), '.blue selector for ' + parentCssId + ' should exist' );

	app.teardown();
} );

QUnit.test( 'should NEVER render CSS with a Ractive instance', function ( assert ) {

	var app = new Ractive( {
		template: '<div></div>',
		css: '\n\t\t\t\t.green {\n\t\t\t\t\tcolor: green\n\t\t\t\t}\n\t\t\t'
	} );

	var css = app.toCSS();

	assert.ok( !~css.indexOf( '.green[data-ractive-css~="{' + app.cssId + '}"], [data-ractive-css~="{' + app.cssId + '}"] .green', '.green selector for ' + app.cssId + ' should NEVER exist' ) );

	app.teardown();
} );
