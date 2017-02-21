const { module, test } = QUnit;

function createComponentDefinition( Ractive ) {

	return Ractive.extend( {
		css: '\n\t\t\t.green {\n\t\t\t\tcolor: green\n\t\t\t}\n\t\t'
	} );
}

export default function(){

	module( 'ractive.toCSS()' );

	test( 'should render CSS with a single component definition', t => {

		const Component = createComponentDefinition( Ractive );

		const cssId = Component.prototype.cssId;
		const css = Ractive.getCSS();

		t.ok( !!~css.indexOf( '.green[data-ractive-css~="{' + cssId + '}"], [data-ractive-css~="{' + cssId + '}"] .green', '.green selector for ' + cssId + ' should exist' ) );
	} );

	test( 'should render CSS with multiple components definition', t => {

		const ComponentA = createComponentDefinition( Ractive );

		const ComponentB = createComponentDefinition( Ractive );

		const cssIdA = ComponentA.prototype.cssId;
		const cssIdB = ComponentB.prototype.cssId;
		const css = Ractive.getCSS();

		// Look for the selectors
		t.ok( !!~css.indexOf( '.green[data-ractive-css~="{' + cssIdA + '}"], [data-ractive-css~="{' + cssIdA + '}"] .green' ), '.green selector for ' + cssIdA + ' should exist' );
		t.ok( !!~css.indexOf( '.green[data-ractive-css~="{' + cssIdB + '}"], [data-ractive-css~="{' + cssIdB + '}"] .green' ), '.green selector for ' + cssIdB + ' should exist' );
	} );
}
