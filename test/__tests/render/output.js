import 'legacy';
import { svg } from 'config/environment';
import tests from 'samples/render';

tests.forEach( theTest => {
	if ( !svg && theTest.svg ) return;
	if ( theTest.nodeOnly ) return;

	test( theTest.name, t => {
		var view, data, j, step;

		data = typeof theTest.data === 'function' ? theTest.data() : deepClone( theTest.data );

		view = new Ractive({
			el: fixture,
			data: data,
			template: theTest.template,
			partials: theTest.partials,
			handlebars: theTest.handlebars, // TODO remove this if handlebars mode becomes default
			debug: true
		});

		t.htmlEqual( fixture.innerHTML, theTest.result, 'innerHTML should match result' );
		t.htmlEqual( view.toHTML(), theTest.result, 'toHTML() should match result' );

		if ( theTest.new_data ) {
			data = typeof theTest.new_data === 'function' ? theTest.new_data() : deepClone( theTest.new_data );
			view.set( data );

			t.htmlEqual( fixture.innerHTML, theTest.new_result, 'innerHTML should match result' );
			t.htmlEqual( view.toHTML(), theTest.new_result, 'toHTML() should match result' );
		} else if ( theTest.steps && theTest.steps.length ) {
			for ( j = 0; j < theTest.steps.length; j++ ) {
				step = theTest.steps[j];
				data = typeof step.data === 'function' ? step.data() : deepClone( step.data );
				view.set( data );

				t.htmlEqual( fixture.innerHTML, step.result, step.message || 'innerHTML should match result' );
				t.htmlEqual( view.toHTML(), step.result, step.message || 'toHTML() should match result' );
			}
		}

		view.teardown();
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
