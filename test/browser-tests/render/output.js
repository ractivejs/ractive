import { test } from 'qunit';
import { svg } from 'config/environment';
import tests from 'samples/render';

function getData ( data ) {
	return typeof data === 'function' ? data() : deepClone( data );
}

tests.forEach( theTest => {
	if ( !svg && theTest.svg ) return;
	if ( theTest.nodeOnly ) return;

	test( theTest.name, t => {
		const data = getData( theTest.data );

		const ractive = new Ractive({
			el: fixture,
			data,
			template: theTest.template,
			partials: theTest.partials,
			handlebars: theTest.handlebars, // TODO remove this if handlebars mode becomes default
			debug: true
		});

		t.htmlEqual( fixture.innerHTML, theTest.result, 'innerHTML should match result' );
		t.htmlEqual( ractive.toHTML(), theTest.result, 'toHTML() should match result' );

		if ( theTest.new_data ) {
			const data = getData( theTest.new_data );

			ractive.set( data );

			t.htmlEqual( fixture.innerHTML, theTest.new_result, 'innerHTML should match result' );
			t.htmlEqual( ractive.toHTML(), theTest.new_result, 'toHTML() should match result' );
		} else if ( theTest.steps && theTest.steps.length ) {
			theTest.steps.forEach( step => {
				const data = getData( step.data );

				ractive.set( data );

				t.htmlEqual( fixture.innerHTML, step.result, step.message || 'innerHTML should match result' );
				t.htmlEqual( ractive.toHTML(), step.result, step.message || 'toHTML() should match result' );
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

	let target = {};

	for ( let key in source ) {
		if ( source.hasOwnProperty( key ) ) {
			target[ key ] = deepClone( source[ key ] );
		}
	}

	return target;
}

function isArray ( thing ) {
	return Object.prototype.toString.call( thing ) === '[object Array]';
}
