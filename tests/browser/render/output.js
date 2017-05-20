import tests from '../../helpers/samples/render';
import { onWarn, initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'render/output.js' );

	function getData ( data ) {
		return typeof data === 'function' ? data() : deepClone( data );
	}

	tests.forEach( theTest => {
		if ( !Ractive.svg && theTest.svg ) return;
		if ( theTest.nodeOnly ) return;

		test( theTest.name, t => {

			// suppress warnings about non-POJOs and failed computations
			onWarn( msg => t.ok( /plain JavaScript object|Failed to compute/.test( msg ) ) );

			// we don't render to an element initially, so we can see what would happen if this was happening server-side with no DOM
			const ractive = new Ractive({
				data: getData( theTest.data || {} ),
				template: theTest.template,
				partials: theTest.partials,
				debug: true
			});


			t.htmlEqual( ractive.toHTML(), theTest.result, 'initial toHTML() should match result' );

			if ( theTest.new_data ) {
				ractive.set( theTest.new_data );

				t.htmlEqual( ractive.toHTML(), theTest.new_result, 'new toHTML() should match result' );
			} else if ( theTest.steps && theTest.steps.length ) {
				theTest.steps.forEach( ( step, i ) => {
					ractive.set( getData( step.data || {} ) );

					t.htmlEqual( ractive.toHTML(), step.result, `step ${i}: ` + ( step.message || 'toHTML() should match result' ) );
				});
			}

			// some tests expect certain orderings that only happen when templates are unbound
			// so we reset to empty and then reload the data before rendering
			ractive.reset();
			ractive.reset( getData( theTest.data ) );
			ractive.render( fixture );

			// we'll also check toHTML again, to make sure it still behaves as expected when rendered
			t.htmlEqual( fixture.innerHTML, theTest.result, 'initial innerHTML should match result' );
			t.htmlEqual( ractive.toHTML(), theTest.result, 'initial toHTML() should match result' );

			if ( theTest.new_data ) {
				ractive.set( theTest.new_data );

				t.htmlEqual( fixture.innerHTML, theTest.new_result, 'new innerHTML should match result' );
				t.htmlEqual( ractive.toHTML(), theTest.new_result, 'new toHTML() should match result' );
			} else if ( theTest.steps && theTest.steps.length ) {
				theTest.steps.forEach( ( step, i ) => {
					ractive.set( getData( step.data || {} ) );

					t.htmlEqual( fixture.innerHTML, step.result, `step ${i}: ` + ( step.message || 'innerHTML should match result' ) );
					t.htmlEqual( ractive.toHTML(), step.result, `step ${i}: ` + ( step.message || 'toHTML() should match result' ) );
				});
			}

			ractive.teardown();
		});
	});

	function deepClone ( source ) {
		if ( !source || typeof source !== 'object' ) {
			return source;
		}

		if ( isArray( source ) ) {
			return source.map( deepClone );
		}

		const target = {};

		for ( const key in source ) {
			if ( source.hasOwnProperty( key ) ) {
				target[ key ] = deepClone( source[ key ] );
			}
		}

		return target;
	}

	function isArray ( thing ) {
		return Object.prototype.toString.call( thing ) === '[object Array]';
	}
}
