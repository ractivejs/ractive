import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'methods/findParent.js' );

	test( '.findParent() finds parent', t => {
		const C4 = Ractive.extend({
			template: 'this space for rent'
		});

		const C3 = Ractive.extend({
			template: '<C4/>',
			components: { C4 }
		});

		const C2 = Ractive.extend({
			template: '<C3/>',
			components: { C3 }
		});

		const C1 = Ractive.extend({
			template: '<C2/>',
			components: { C2 }
		});

		const ractive = new Ractive( {
			el: fixture,
			template: '<C1/>',
			components: { C1 }
		});

		const c1 = ractive.findComponent( 'C1' );
		const c2 = ractive.findComponent( 'C2' );
		const c3 = ractive.findComponent( 'C3' );
		const c4 = ractive.findComponent( 'C4' );

		t.equal( c4.findParent( 'foo' ), null );
		t.equal( c4.findParent( 'C3' ), c3 );
		t.equal( c4.findParent( 'C2' ), c2 );
		t.equal( c4.findParent( 'C1' ), c1 );

		t.equal( c3.findParent( 'C4' ), null );
		t.equal( c3.findParent( 'C3' ), null );
		t.equal( c3.findParent( 'C2' ), c2 );
		t.equal( c3.findParent( 'C1' ), c1 );

		t.equal( c2.findParent( 'C1' ), c1 );
	});
}
