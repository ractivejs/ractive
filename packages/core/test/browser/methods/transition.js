import { fire } from 'simulant';
import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'methods/transition.js' );

	test( 'Transitions method', t => {
		const done = t.async();
		t.expect(3);

		const ractive = new Ractive({
			el: fixture,
			template: '<div></div>',
			transitions: { fade }
		});

		function fade ( t ) {
			t.setStyle( 'opacity', 0 );
			return t.animateStyle( 'opacity', t.params.opacity, { duration: 50 } );
		}

		const div = ractive.find( 'div' );
		t.equal( div.style.opacity, '' );

		// string name of transition
		ractive.transition( 'fade', div, { opacity: 0.5 } )
			.then( () => {
				t.equal( div.style.opacity, 0.5 );
				// function
				return ractive.transition( fade, div, { opacity: 1 } );
			})
			.then( () => {
				t.equal( div.style.opacity, 1 );
				done();
			});
	});

	// this test really likes to randomly fail on phantom
	if ( !/phantom/i.test( navigator.userAgent ) ) {
		test( 'Use transitions from event with implicit node', t => {
			const done = t.async();
			t.expect(2);

			const ractive = new Ractive({
				el: fixture,
				template: `<div on-click='@this.transition("fade")'></div>`,
				transitions: { fade }
			});

			function fade ( t ) {
				t.setStyle( 'opacity', 1 );
				return t.animateStyle( 'opacity', 0, { duration: 50 } );
			}

			const div = ractive.find( 'div' );
			t.equal( div.style.opacity, '' );

			fire( div, 'click' );

			setTimeout( () => {
				t.equal( div.style.opacity, 0 );
				done();
			}, 100);

		});
	}
}
