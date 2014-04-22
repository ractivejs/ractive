define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, Foo;

		module( 'Computations' );

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );

		test( 'Computed value declared as a function', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<p>area: {{area}}</p>',
				data: {
					width: 10,
					height: 10
				},
				computed: {
					area: function () {
						return this.get( 'width' ) * this.get( 'height' )
					}
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>area: 100</p>' );

			ractive.set( 'width', 15 );
			t.htmlEqual( fixture.innerHTML, '<p>area: 150</p>' );

			ractive.set( 'height', 15 );
			t.htmlEqual( fixture.innerHTML, '<p>area: 225</p>' );
		});

		test( 'Computed value declared as a string', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<p>area: {{area}}</p>',
				data: {
					width: 10,
					height: 10
				},
				computed: {
					area: '${width} * ${height}'
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>area: 100</p>' );

			ractive.set( 'width', 15 );
			t.htmlEqual( fixture.innerHTML, '<p>area: 150</p>' );

			ractive.set( 'height', 15 );
			t.htmlEqual( fixture.innerHTML, '<p>area: 225</p>' );
		});

		test( 'Computed value with a set() method', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<p>First name: {{first}}</p><p>Last name: {{last}}</p><p>Full name: {{full}}</p>',
				data: {
					first: 'Jim',
					last: 'Beam'
				},
				computed: {
					full: {
						get: '${first} + " " + ${last}',
						set: function ( fullname ) {
							var parts = fullname.split( ' ' );

							this.set({
								first: parts[0] || '',
								last: parts[1] || ''
							});
						}
					}
				}
			});

			t.equal( ractive.get( 'full' ), 'Jim Beam' );
			t.htmlEqual( fixture.innerHTML, '<p>First name: Jim</p><p>Last name: Beam</p><p>Full name: Jim Beam</p>' );

			ractive.set( 'last', 'Belushi' );
			t.equal( ractive.get( 'full' ), 'Jim Belushi' );
			t.htmlEqual( fixture.innerHTML, '<p>First name: Jim</p><p>Last name: Belushi</p><p>Full name: Jim Belushi</p>' );

			ractive.set( 'full', 'John Belushi' );
			t.equal( ractive.get( 'first' ), 'John' );
			t.htmlEqual( fixture.innerHTML, '<p>First name: John</p><p>Last name: Belushi</p><p>Full name: John Belushi</p>' );
		});

		test( 'Components can have default computed properties', function ( t ) {
			var Box, ractive;

			Box = Ractive.extend({
				template: '<div style="width: {{width}}px; height: {{height}}px;">{{area}}px squared</div>',
				computed: {
					area: '${width} * ${height}'
				}
			});

			ractive = new Ractive({
				el: fixture,
				template: '<box width="{{width}}" height="{{height}}"/>',
				data: {
					width: 100,
					height: 100
				},
				components: { box: Box }
			});

			t.htmlEqual( fixture.innerHTML, '<div style="width: 100px; height: 100px;">10000px squared</div>' );

			ractive.set( 'width', 200 );
			t.htmlEqual( fixture.innerHTML, '<div style="width: 200px; height: 100px;">20000px squared</div>' );
		});

		test( 'Instances can augment default computed properties of components', function ( t ) {
			var Box, ractive;

			Box = Ractive.extend({
				template: '<div style="width: {{width}}px; height: {{height}}px;">{{area}}px squared</div>',
				computed: {
					area: '${width} * ${height}'
				}
			});

			ractive = new Box({
				el: fixture,
				data: {
					width: 100,
					height: 100
				},
				computed: { irrelevant: '"foo"' }
			});

			t.htmlEqual( fixture.innerHTML, '<div style="width: 100px; height: 100px;">10000px squared</div>' );

			ractive.set( 'width', 200 );
			t.htmlEqual( fixture.innerHTML, '<div style="width: 200px; height: 100px;">20000px squared</div>' );
		});

		test( 'Computed values can depend on other computed values', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{number}} - {{squared}} - {{cubed}}',
				data: { number: 5 },
				computed: {
					squared: '${number} * ${number}',
					cubed: '${squared} * ${number}'
				}
			});

			t.htmlEqual( fixture.innerHTML, '5 - 25 - 125' );

			ractive.add( 'number', 1 );
			t.htmlEqual( fixture.innerHTML, '6 - 36 - 216' );
		});

		test( 'Computations that cause errors are considered undefined', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{uppercaseBar}}',
				computed: {
					uppercaseBar: '${foo}.bar.toUpperCase()'
				}
			});

			t.htmlEqual( fixture.innerHTML, '' );

			ractive.set( 'foo.bar', 'works' );
			t.htmlEqual( fixture.innerHTML, 'WORKS' );
		})

	};

});
