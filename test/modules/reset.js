define([ 'Ractive' ], function ( Ractive ) {

	'use strict';

	Ractive = Ractive.default || Ractive;

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

		asyncTest( 'ractive.reset() returns a promise', function ( t ) {
			var ractive, callback, counter, done;

			ractive = new Ractive({
				el: fixture,
				template: '{{one}}{{two}}{{three}}',
				data: { one: 1, two: 2, three: 3 }
			});

			counter = 2;
			done = function () { --counter || start(); };

			callback = function(){
				t.ok(true);
				done()
			};

			expect(6)
			ractive.reset({ two: 4 }).then(callback);
			t.htmlEqual( fixture.innerHTML, '4' );
			ractive.reset({ one: 9 }).then(callback);
			t.htmlEqual( fixture.innerHTML, '9' );
			ractive.reset().then(callback);
			t.htmlEqual( fixture.innerHTML, '' );
		});

		asyncTest( 'Dynamic template functions are recalled on reset', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: function ( d ) {
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

		asyncTest( 'Promise with dynamic template functions are recalled on reset', function ( t ) {
			var ractive, callback, counter, done;

			ractive = new Ractive({
				el: fixture,
				template: function ( d ) {
					return d.condition ? '{{foo}}' : '{{bar}}'
				},
				data: { foo: 'fizz', bar: 'bizz', condition: true }
			});

			counter = 2;
			done = function () { --counter || start(); };

			callback = function(){
				t.ok(true);
				done()
			};

			expect(5);

			t.htmlEqual( fixture.innerHTML, 'fizz' );
			ractive.set('condition', false)
			ractive.reset(ractive.data).then(callback);
			t.htmlEqual( fixture.innerHTML, 'bizz' );
			ractive.set('condition', true)
			ractive.reset(ractive.data).then(callback);
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

		// Removed this functionality for now as not apparent
		// what purpose of calling resetTemplate() without rerender
		/*
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
		*/

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

			t.htmlEqual( fixture.innerHTML, '<div id="target"><div>bar</div></div>' );

			ractive = new Ractive({
				el: target,
				append: anchor,
				template: '<div>{{what}}</div>',
				data: { what: 'fizz' }
			});

			t.htmlEqual( fixture.innerHTML, '<div id="target"><div>fizz</div><div>bar</div></div>' );
			ractive.reset( { what: 'foo' } );
			t.htmlEqual( fixture.innerHTML, '<div id="target"><div>foo</div><div>bar</div></div>' );
		});

		test( 'resetTemplate removes an inline component from the DOM (#928)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<widget type="{{type}}"/>',
				data: {
					type: 1
				},
				components: {
					widget: Ractive.extend({
						template: function ( data ) {
							return data.type === 1 ? 'ONE' : 'TWO';
						},
						oninit: function () {
							this.observe( 'type', function ( type ) {
								this.resetTemplate( type === 1 ? 'ONE' : 'TWO' );
							}, { init: false });
						}
					})
				}
			});

			ractive.set( 'type', 2 );
			t.htmlEqual( fixture.innerHTML, 'TWO' );
		});

		test( 'reset removes correctly from the DOM (#941)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{#active}}active{{/active}}{{^active}}not active{{/active}}',
				data: {
					active: false
				}
			});

			t.htmlEqual( fixture.innerHTML, 'not active' );
			ractive.reset( { active: true } );
			t.htmlEqual( fixture.innerHTML, 'active' );
		});

		test( 'reset does not re-render if template does not change', function ( t ) {
			var p, ractive = new Ractive({
				el: fixture,
				template: '<p>me</p>',
				data: {
					active: false
				}
			});

			p = ractive.find( 'p' );
			t.ok( p );
			ractive.reset( { active: true } );
			t.equal( ractive.find('p'), p );
		});

		test( 'reset does not re-render if template function does not change', function ( t ) {
			var p, ractive = new Ractive({
				el: fixture,
				template: function( data ) {
					return data.active ? '<p>active</p>' : '<p>not active</p>';
				},
				data: {
					active: false
				}
			});

			p = ractive.find( 'p' );
			t.ok( p );
			ractive.reset( { active: false } );
			t.equal( ractive.find('p'), p );
		});

		test( 'reset does re-render if template changes', function ( t ) {
			var p, ractive = new Ractive({
				el: fixture,
				template: function( data ) {
					return data.active ? '<p>active</p>' : '<p>not active</p>';
				},
				data: {
					active: false
				}
			});

			p = ractive.find( 'p' );
			t.ok( p );
			ractive.reset( { active: true } );
			t.notEqual( ractive.find('p'), p );
		});

		test( 'reset removes an inline component from the DOM', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<widget type="{{type}}"/>',
				data: {
					type: 1
				},
				components: {
					widget: Ractive.extend({
						template: function ( data ) {
							return data.type === 1 ? 'ONE' : 'TWO';
						},
						oninit: function () {
							this.observe( 'type', function ( type ) {
								this.reset( { type: type } );
							}, { init: false });
						}
					})
				}
			});

			ractive.set( 'type', 2 );
			t.htmlEqual( fixture.innerHTML, 'TWO' );
		});
	};

});
