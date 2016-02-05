/*global require, describe, it */
const Ractive = require( '../../ractive' );
const assert = require( 'assert' );

function createComponentDefinition( Ractive ) {

	return Ractive.extend( {
		css: `
			.green {
				color: green
			}
		`
	} );

}

describe( 'ractive.toCSS()', () => {

	it( 'should render CSS with a single component definition', () => {

		const Component = createComponentDefinition( Ractive );

		const cssId = Component.prototype.cssId;
		const css = Ractive.getCSS();

		assert( !!~css.indexOf( `.green[data-ractive-css~="{${cssId}}"], [data-ractive-css~="{${cssId}}"] .green`, `.green selector for ${cssId} should exist` ) );

	} );

	it( 'should render CSS with multiple components definition', () => {

		const ComponentA = createComponentDefinition( Ractive );

		const ComponentB = createComponentDefinition( Ractive );

		const cssIdA = ComponentA.prototype.cssId;
		const cssIdB = ComponentB.prototype.cssId;
		const css = Ractive.getCSS();

		// Look for the selectors
		assert( !!~css.indexOf( `.green[data-ractive-css~="{${cssIdA}}"], [data-ractive-css~="{${cssIdA}}"] .green` ), `.green selector for ${cssIdA} should exist` );
		assert( !!~css.indexOf( `.green[data-ractive-css~="{${cssIdB}}"], [data-ractive-css~="{${cssIdB}}"] .green` ), `.green selector for ${cssIdB} should exist` );

	} );


} );
