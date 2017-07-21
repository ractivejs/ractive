import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'methods/animate.js' );

	test( 'Values that cannot be interpolated change to their final value immediately', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<p>{{name}}</p>',
			data: {
				name: 'foo'
			}
		});

		ractive.animate( 'name', 'bar' );
		t.htmlEqual( fixture.innerHTML, '<p>bar</p>' );
	});

	test( 'ractive.animate() returns a promise that resolves when the animation completes (#1047)', t => {
		const done = t.async();

		const ractive = new Ractive({
			el: fixture,
			template: '{{~~foo}}',
			data: { foo: 0 }
		});

		ractive.animate( 'foo', 100, { duration: 10 }).then( () => {
			t.htmlEqual( fixture.innerHTML, '100' );
			done();
		});
	});

	test( 'ractive.animate() returns a promise even if nothing changes', t => {
		t.expect( 3 );

		const ractive = new Ractive();
		const promise = ractive.animate( 'foo', 'x' );

		t.ok( promise.then );
		t.ok( promise.catch );
		t.ok( promise.stop );
	});

	test( `ractive.animate() on a linked path returns a promise`, t => {
		const done = t.async();

		const r = new Ractive({
			data: {
				foo: 10
			}
		});

		r.link( 'foo', 'bar' );

		const promise = r.animate( 'bar', 1 );

		t.ok( typeof promise.then === 'function' );
		promise.then( () => {
			t.equal( r.get( 'foo' ), 1 );
			done();
		});
	});

	test( 'all animations are updated in a single batch', t => {
		const done = t.async();

		let fooSteps = 0;
		let barSteps = 0;
		let bazSteps = 0;

		const ractive = new Ractive({
			el: fixture,
			template: '{{baz}}',
			computed: {
				baz () {
					bazSteps += 1;
					return this.get( 'foo' ) + this.get( 'bar' );
				}
			},
			data: {
				foo: 1,
				bar: 1
			}
		});

		bazSteps = 0;

		const p1 = ractive.animate( 'foo', 100, {
			duration: 100,
			step: () => fooSteps += 1
		});

		const p2 = ractive.animate( 'bar', 100, {
			duration: 100,
			step: () => barSteps += 1
		});

		Promise.all([ p1, p2 ]).then( () => {
			// slightly non-deterministic, so we fuzz it –
			// important thing is that computation doesn't
			// update for all changes to both foo and bar
			const FUZZ = 1.2;

			t.ok( bazSteps < fooSteps * FUZZ );
			t.ok( bazSteps < barSteps * FUZZ );

			done();
		});
	});

	test( 'animations cancel existing animations on the same keypath', t => {
		t.expect( 1 );

		const done = t.async();

		const ractive = new Ractive({
			el: fixture,
			data: {
				foo: 1
			}
		});

		function shouldBeCancelled () {
			t.ok( false, 'animation should be cancelled' );
		}

		ractive.animate( 'foo', 100, {
			step: shouldBeCancelled
		});

		// animating single keypath directly
		return ractive.animate( 'foo', 200, {
			duration: 50
		}).then( () => {
			t.equal( ractive.get( 'foo' ), 200 );
			done();
		});
	});

	test( 'set operations cancel existing animations on the same keypath', t => {
		t.expect( 1 );

		const done = t.async();

		const ractive = new Ractive({
			el: fixture,
			data: {
				foo: 1
			}
		});

		function shouldBeCancelled () {
			t.ok( false, 'animation should be cancelled' );
		}

		ractive.animate( 'foo', 100, {
			step: shouldBeCancelled
		});

		// animating single keypath directly
		ractive.set( 'foo', 200 );
		t.equal( ractive.get( 'foo' ), 200 );

		// wait to check step function isn't called
		setTimeout( done, 50 );
	});

	test( 'interpolates correctly between objects with identical properties', t => {
		t.expect( 3 );

		const done = t.async();

		const ractive = new Ractive({
			data: { obj: { x: 1, y: 2 } }
		});

		let ignore = false;

		ractive.animate( 'obj', { x: 1, y: 3 }, {
			step ( pos, { x, y }) {
				if ( ignore ) return;

				//const { x, y } = ractive.get( 'obj' );
				t.equal( x, 1 );
				t.ok( y > 2 && y <= 3 );

				ignore = true;
			},
			duration: 50
		}).then( () => {
			t.deepEqual( ractive.get( 'obj' ), { x: 1, y: 3 });
			done();
		});
	});

	test( 'Named easing functions are taken from the instance', t => {
		t.expect( 0 );

		const ractive = new Ractive({
			data: { x: 0 }
		});

		ractive.animate( 'x', 1, { easing: 'easeOut' });
	});

	test( `animating an array animates the values in the array`, t => {
		const done = t.async();

		const r = new Ractive({
			data: { foo: [ 1, 2, 3 ] }
		});

		r.animate( 'foo', [ 4, 5, 6 ], { duration: 10 } ).then( () => {
			t.deepEqual( r.get( 'foo' ), [ 4, 5, 6 ] );
			done();
		});

		t.deepEqual( r.get( 'foo' ), [ 1, 2, 3 ] );
	});

	test( `animate promise resolves with the target value`, t => {
		t.expect( 3 );
		const done = t.async();

		const r = new Ractive({
			data: { num: 1 }
		});

		r.animate( 'num', 1 ).then( v => {
			t.equal( v, 1 );
			return r.animate( 'num', 10, { easing: 'frizzle' }).then( v => {
				t.equal( v, 10 );
				return r.animate( 'num', 1 ).then( v => {
					t.equal( v, 1 );
				});
			});
		}).then( done, done );
	});

	test( `animate uses given interpolator if available`, t => {
		t.expect( 1 );
		const done = t.async();

		const cmp = Ractive.extend({
			interpolators: {
				test ( v1, v2 ) {
					t.ok( true, 'interpolator used' );
					return () => v2;
				}
			}
		});

		const r = new cmp({
			data: { v: 1 }
		});

		r.animate( 'v', 10, { interpolator: 'test' } ).then( done, done );
	});
}
