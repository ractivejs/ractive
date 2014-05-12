define([ 'ractive' ], function ( Ractive ) {

	'use strict';

	return function () {

		var fixture = document.getElementById( 'qunit-fixture' );

		module( 'ractive.reset()' );

		test( 'Basic reset', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{one}}{{two}}{{three}}',
				data: { one: 1, two: 2, three: 3 }
			});

			ractive.reset({ two: 4 });
			t.htmlEqual( fixture.innerHTML, '4' );
		});

		test( 'Invalid arguments', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
			});

			throws(function(){
				ractive.reset("data");
			})

			//Assuming that data fn's are not allowed on reset
			//caller could just execute themselves:
			//ractive.reset(fn(), cb)
			//Otherwise introduces ambiguity...
			throws(function(){
				ractive.reset(function(){}, function(){});
			})

		});

		asyncTest( 'Callback and promise with reset', function ( t ) {
			var ractive = new Ractive({
					el: fixture,
					template: '{{one}}{{two}}{{three}}',
					data: { one: 1, two: 2, three: 3 }
				}),
				callback = function(){
					ok(true);
					start();
				}

			expect(6)
			ractive.reset({ two: 4 }, callback);
			t.htmlEqual( fixture.innerHTML, '4' );
			ractive.reset({ one: 9 }).then(callback);
			t.htmlEqual( fixture.innerHTML, '9' );
			ractive.reset(callback);
			t.htmlEqual( fixture.innerHTML, '' );
		});

		asyncTest( 'Dynamic template functions are recalled on reset', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: function(d, o, t){
					return d.condition ? '{{foo}}' : '{{bar}}'
				},
				data: { foo: 'fizz', bar: 'bizz', condition: true }
			});

			t.htmlEqual( fixture.innerHTML, 'fizz' );
			ractive.set('condition', false)
			ractive.reset(ractive.data).then( function () {
				t.htmlEqual( fixture.innerHTML, 'bizz' );
				start();
			});
		});

		asyncTest( 'Callback and promise with dynamic template functions are recalled on reset', function ( t ) {
			var ractive = new Ractive({
					el: fixture,
					template: function(d, o, t){
						return d.condition ? '{{foo}}' : '{{bar}}'
					},
					data: { foo: 'fizz', bar: 'bizz', condition: true }
				}),
				callback = function(){
					t.ok(true);
					if ( !--remaining ) {
						start();
					}
				},
				remaining = 2;

			expect(5);

			t.htmlEqual( fixture.innerHTML, 'fizz' );
			ractive.set('condition', false)
			ractive.reset(ractive.data).then(callback);
			t.htmlEqual( fixture.innerHTML, 'bizz' );
			ractive.set('condition', true)
			ractive.reset(ractive.data, callback);
			t.htmlEqual( fixture.innerHTML, 'fizz' );

		});

		test( 'resetTemplate rerenders with new template', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{foo}}',
				data: { foo: 'fizz', bar: 'bizz' }
			});

			t.htmlEqual( fixture.innerHTML, 'fizz' );
			ractive.resetTemplate('{{bar}}')
			t.htmlEqual( fixture.innerHTML, 'bizz' );

		});

		test( 'resetTemplate with no template change doesnt rerender', function ( t ) {
			var p, ractive = new Ractive({
				el: fixture,
				template: '<p>{{foo}}</p>',
				data: { foo: 'fizz' }
			});

			p = ractive.find('p');
			t.htmlEqual( fixture.innerHTML, '<p>fizz</p>' );
			ractive.resetTemplate('<p>{{foo}}</p>');
			t.htmlEqual( fixture.innerHTML, '<p>fizz</p>' );
			t.equal( ractive.find('p'), p);
			ractive.resetTemplate('<p>bar</p>');
			t.htmlEqual( fixture.innerHTML, '<p>bar</p>' );
			t.notEqual( ractive.find('p'), p);
		});

		test( 'Reset retains parent default data (#572)', function ( t ) {
			var ractive, Widget;

			Widget = Ractive.extend({
			  data: {
			    uppercase: function ( str ) {
			      return str.toUpperCase();
			    }
			  }
			});

			ractive = new Widget({
			  el: fixture,
			  template: '{{ uppercase(foo) }}',
			  data: { foo: 'bar' }
			});

			ractive.reset({ foo: 'bizz' });
			t.htmlEqual( fixture.innerHTML, 'BIZZ' );

		});

		test( 'Reset inserts { target, anchor } el option correctly', function ( t ) {
			var ractive,
				target = document.createElement('div'),
				anchor = document.createElement('div');

			anchor.innerHTML = 'bar';
			target.id = 'target';
			target.appendChild( anchor );
			fixture.appendChild( target );

			t.equal( fixture.innerHTML, '<div id="target"><div>bar</div></div>' );

			ractive = new Ractive({
				el: target,
				append: anchor,
				template: '<div>{{what}}</div>',
				data: { what: 'fizz' }
			});

			t.equal( fixture.innerHTML, '<div id="target"><div>fizz</div><div>bar</div></div>' );
			ractive.reset( { what: 'foo' } );
			t.equal( fixture.innerHTML, '<div id="target"><div>foo</div><div>bar</div></div>' );


		});
	};

});
