import { test } from 'qunit';

/* global setTimeout */

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

	ractive.animate( 'foo', 100, { duration: 10 }).then( function () {
		t.htmlEqual( fixture.innerHTML, '100' );
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

	Ractive.Promise.all([ p1, p2 ]).then( () => {
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

	let ractive = new Ractive({
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

	let ractive = new Ractive({
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

test( 'animate can get used with a context', t => {
	const done = t.async();

	const r = new Ractive({
		el: fixture,
		template: `{{#with foo.bar}}<span>{{.baz}}</span>{{/with}}`,
		data: { foo: { bar: { baz: 1 } } }
	});

	r.animate( '.baz', r.find( 'span' ), 10 ).then( () => {
		t.equal( r.get( 'foo.bar.baz' ), 10 );
		done();
	});
});
