import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/detachChild.js' );

	test( `detached children are unrendered if they are targeted`, t => {
		fixture.innerHTML = '<div id="r1"></div><div id="r2"></div>';
		const r1 = new Ractive({
			template: 'r1',
			el: fixture.children[0]
		});
		const r2 = new Ractive({
			template: 'r2{{>>foo}}',
			el: fixture.children[1]
		});

		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1</div><div id="r2">r2</div>' );
		r2.attachChild( r1 );
		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1</div><div id="r2">r2</div>' );
		r2.detachChild( r1 );
		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1</div><div id="r2">r2</div>' );
		r2.attachChild( r1, { target: 'foo' } );
		t.htmlEqual( fixture.innerHTML, '<div id="r1"></div><div id="r2">r2r1</div>' );
		r2.detachChild( r1 );
		t.htmlEqual( fixture.innerHTML, '<div id="r1"></div><div id="r2">r2</div>' );
	});

	test( `detaching a non-attached child throws an error`, t => {
		const r = new Ractive({
			el: fixture
		});
		const other = new Ractive({});

		t.throws( () => {
			r.detachChild( other );
		}, /not attached/ );
	});
}
