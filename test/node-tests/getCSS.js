/*global require, describe, it */
'use strict';

var Ractive = require( '../../ractive' );
var assert = require( 'assert' );

function createComponentDefinition( Ractive ) {

	return Ractive.extend( {
		css: '\n\t\t\t.green {\n\t\t\t\tcolor: green\n\t\t\t}\n\t\t'
	} );
}

describe( 'ractive.toCSS()', function() {

	it( 'should render CSS with a single component definition', function() {

		var Component = createComponentDefinition( Ractive );

		var cssId = Component.prototype.cssId;
		var css = Ractive.getCSS();

		assert( !!~css.indexOf( '.green[data-ractive-css~="{' + cssId + '}"], [data-ractive-css~="{' + cssId + '}"] .green', '.green selector for ' + cssId + ' should exist' ) );
	} );

	it( 'should render CSS with multiple components definition', function() {

		var ComponentA = createComponentDefinition( Ractive );

		var ComponentB = createComponentDefinition( Ractive );

		var cssIdA = ComponentA.prototype.cssId;
		var cssIdB = ComponentB.prototype.cssId;
		var css = Ractive.getCSS();

		// Look for the selectors
		assert( !!~css.indexOf( '.green[data-ractive-css~="{' + cssIdA + '}"], [data-ractive-css~="{' + cssIdA + '}"] .green' ), '.green selector for ' + cssIdA + ' should exist' );
		assert( !!~css.indexOf( '.green[data-ractive-css~="{' + cssIdB + '}"], [data-ractive-css~="{' + cssIdB + '}"] .green' ), '.green selector for ' + cssIdB + ' should exist' );
	} );
} );
