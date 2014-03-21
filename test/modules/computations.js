define([ 'Ractive' ], function ( Ractive ) {

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

	};

});
