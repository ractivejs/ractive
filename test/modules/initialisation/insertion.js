define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture, placement, setup;

		// some set-up
		fixture = document.getElementById( 'qunit-fixture' );
		setup = {
			setup: function () {
				var target = document.createElement('div'), 
					child = document.createElement('div');

				child.innerHTML = 'bar';
				target.id = 'target';
				target.appendChild( child );
				fixture.appendChild( target );

				equal( fixture.innerHTML, '<div id="target"><div>bar</div></div>' );

				placement = { target: target, child: child };
			}	
		};

		module( 'Element Selector', setup );

		test( 'Element by id selector', function ( t ) {
			var ractive

			ractive = new Ractive({
				el: '#target',
				template: '<div>foo</div>'
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
		});

		test( 'Element by id (hashless)', function ( t ) {
			var ractive

			ractive = new Ractive({
				el: 'target',
				template: '<div>foo</div>'
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
		});

		test( 'Element by query selector', function ( t ) {
			var ractive

			ractive = new Ractive({
				el: 'div[id=target]',
				template: '<div>foo</div>'
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
		});

		test( 'Element by node', function ( t ) {
			var ractive

			ractive = new Ractive({
				el: placement.target,
				template: '<div>foo</div>'
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
		});

		test( 'Element by nodelist', function ( t ) {
			var ractive

			ractive = new Ractive({
				el: fixture.querySelectorAll('div'),
				template: '<div>foo</div>'
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
		});

		test( 'Element by any array-like', function ( t ) {
			var ractive

			ractive = new Ractive({
				el: [placement.target],
				template: '<div>foo</div>'
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
		});


		module( 'Placement', setup );

		test( 'Default replaces content', function ( t ) {
			var ractive

			ractive = new Ractive({
				el: placement.target,
				template: '<div>foo</div>'
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
		});

		test( 'Default replaces content', function ( t ) {
			var ractive

			ractive = new Ractive({
				el: placement.target,
				template: '<div>foo</div>'
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
		});

		test( 'Append false (normal default) replaces content', function ( t ) {
			var ractive

			ractive = new Ractive({
				el: placement.target,
				template: '<div>foo</div>',
				append: false
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>foo</div></div>' );
		});

		test( 'Append true option inserts as last child node', function ( t ) {
			var ractive

			ractive = new Ractive({
				el: placement.target,
				template: '<div>foo</div>',
				append: true
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>bar</div><div>foo</div></div>' );
		});


		test( 'Append with anchor inserts before anchor', function ( t ) {
			var ractive

			ractive = new Ractive({
				el: placement.target,
				template: '<div>foo</div>',
				append: placement.child
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>foo</div><div>bar</div></div>' );
		});


	};



});
