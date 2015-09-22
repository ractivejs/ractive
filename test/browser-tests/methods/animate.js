import { test } from 'qunit';

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

test( 'ractive.animate() returns a promise that resolves when the animation completes when using a map of values (#1047)', t => {
	const done = t.async();

	const ractive = new Ractive({
		el: fixture,
		template: '{{~~foo}}',
		data: { foo: 0 }
	});

	ractive.animate({ foo: 100 }, { duration: 10 }).then( function () {
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

	Promise.all([ p1, p2 ]).then( () => {
		t.equal( fooSteps, bazSteps );
		t.equal( barSteps, bazSteps );

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
});
