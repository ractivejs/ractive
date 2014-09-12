define([ 'ractive', 'legacy' ], function ( Ractive, legacy ) {

	'use strict';

	return function () {

		var fixture, partialsFn;

		module( 'partials' );

		fixture = document.getElementById( 'qunit-fixture' );

		partialsFn = {
			foo: function ( data ) {
				return data.foo ? '<p>yes</p>' : '<h1>no</h1>';
			}
		}

		test( 'specify partial by function', function ( t ) {

			var ractive = new Ractive({
				el: fixture,
				template: '{{>foo}}',
				data: { foo: true },
				partials: partialsFn
			});

			t.htmlEqual( fixture.innerHTML, '<p>yes</p>' );

		});

		if ( console && console.warn ) {

			test( 'no return of partial warns in debug', function ( t ) {

				var ractive, warn = console.warn;

				expect( 2 ); //throws counts as an assertion

				console.warn = function( msg ) {
					t.ok( msg );
				}

				// will throw on no-partial found
				throws( () => {
					ractive = new Ractive({
						el: fixture,
						template: '{{>foo}}',
						data: { foo: true },
						debug: true,
						partials: {
							foo: function ( data ) {
								// where's my partial?
							}
						}
					});
				});

				console.warn = warn;

			});
		}

		test( '`this` in function refers to ractive instance', function ( t ) {

			var thisForFoo, thisForBar, ractive;

			ractive = new Ractive({
				el: fixture,
				template: '{{>foo}}<widget/>',
				data: { foo: true },
				components: {
					widget: Ractive.extend({
						template: '{{>bar}}'
					})
				},
				partials: {
					foo: function ( ) {
						thisForFoo = this;
						return 'foo';
					},
					bar: function ( ) {
						thisForBar = this;
						return 'bar';
					}
				}
			});

			t.equal( thisForFoo, ractive );
			t.equal( thisForBar, ractive );

		});

		test( 'partial function has access to parser helper', function ( t ) {

			expect( 1 );

			var ractive = new Ractive({
				el: fixture,
				template: '{{>foo}}',
				partials: {
					foo: function ( data, parser ) {
						t.ok( parser.fromId )
					}
				}
			});

		});

		test( 'partial can be preparsed template (gh-942)', function ( t ) {

			var ractive, partial = Ractive.parse('<p>hello partial</p>');

			ractive = new Ractive({
				el: fixture,
				template: '{{>foo}}',
				partials: { foo: partial }
			});

			t.equal( fixture.innerHTML, '<p>hello partial</p>' );
		});

		test( 'partial functions belong to instance, not Component', function ( t ) {

			var Component, ractive1, ractive2;

			Component = Ractive.extend({
				template: '{{>foo}}',
				partials: partialsFn
			});

			ractive1 = new Component({
				data: { foo: true }
			});

			ractive2 = new Component({
				data: { foo: false }
			});

			t.equal( ractive1.toHTML(), '<p>yes</p>' );
			t.equal( ractive2.toHTML(), '<h1>no</h1>' );


		});

		test( 'partial functions selects same partial until reset', function ( t ) {

			var ractive = new Ractive({
				el: fixture,
				template: '{{#items}}{{>foo}}{{/items}}',
				partials: {
					foo: function ( data ) {
						return data.foo ? '<p>{{.}}</p>' : '<h1>{{.}}</h1>'
					}
				},
				data: {
					foo: true,
					items: [ 1 ]
				}
			});

			t.htmlEqual( fixture.innerHTML, '<p>1</p>' );

			ractive.set( 'foo', false );
			ractive.get( 'items' ).push( 2 );

			t.htmlEqual( fixture.innerHTML, '<p>1</p><p>2</p>' );
		});

		test( 'reset data re-evaluates partial function', function ( t ) {

			var ractive = new Ractive({
				el: fixture,
				template: '{{>foo}}',
				data: { foo: true },
				partials: partialsFn
			});

			t.htmlEqual( fixture.innerHTML, '<p>yes</p>' );
			ractive.reset( { foo: false } );
			t.htmlEqual( fixture.innerHTML, '<h1>no</h1>' );

		});

		test( 'partials functions can be found on view heirarchy', function ( t ) {

			var Component, ractive;

			Component = Ractive.extend({
				template: '{{>foo}}'
			});

			ractive = new Ractive({
				el: fixture,
				template: '{{#if !foo}}<widget/>{{/if}}',
				components: {
					widget: Component
				},
				data: { foo: true },
				partials: partialsFn
			});

			t.htmlEqual( fixture.innerHTML, '' );
			ractive.set( 'foo', false );
			t.htmlEqual( fixture.innerHTML, '<h1>no</h1>' );

		});

		test( 'static partials are compiled on Component not instance', function ( t ) {

			var Component, ractive;

			Component = Ractive.extend({
				template: '{{>foo}}',
				partials: {
					foo: '<p>{{foo}}</p>'
				}
			});

			ractive = new Component({
				el: fixture
			});

			t.ok( !ractive.partials.hasOwnProperty( 'foo' ) );
			t.deepEqual( Component.partials.foo, [{"t":7,"e":"p","f":[{"t":2,"r":"foo"}]}] );
		});

		test( 'Partials work in attributes (#917)', function ( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '<div style="{{>boxAttr}}"/>',
				partials: {
					boxAttr: 'height: {{height}}px;'
				},
				data: {
					height: 100
				}
			});

			ractive.set( 'height', 200 );

			t.htmlEqual( fixture.innerHTML, '<div style="height: 200px;"></div>' );
		})

		test( 'Partial mustaches can be references or expressions that resolve to a partial', function ( t ) {
			// please never do anything like this
			var ractive = new Ractive({
				el: fixture,
				template: '{{#items}}{{>.type}}{{/}}{{>test + ".partial"}}{{>part(1)}}\n' +
					'<div id="{{>id(test)}}">{{>guts}}</div>{{>("NEST" + "ED").toLowerCase()}} {{>onTheFly("george")}} {{>last0}}',
				data: {
					items: [ { type: 'foo' }, { type: 'bar' }, { type: 'foo' }, { type: 'baz' } ],
					test: 'a',
					part: function(id) { return 'part' + id; },
					id: function(test) { return test + 'divid'; },
					last: {
						one: function() { return 'st'; }
					},
					onTheFly: function(v) {
						var str = 's' + Math.random();
						this.partials[str] = 'onTheFly:{{' + v + '}}';
						return str;
					},
					george: 'plimpton',
					last0: 'last1',
					last30: 'last3',
					last40: 'last4'
				},
				partials: {
					foo: 'foo',
					bar: 'bar',
					baz: 'baz',
					'a.partial': '- a partial',
					'b.partial': '- b partial',
					part1: 'hello',
					adivid: 'theid',
					bdivid: 'otherid',
					guts: '<h1>{{>(\'part\' + 1)}} plain partial</h1>',
					nested: 'ne{{>manylayered}}ed',
					manylayered: '{{>last.one()}}',
					'st': 'st',
					'wt': 'wt',
					last1: '{{>last30}}',
					last2: '{{>last40}}',
					last3: 'last3',
					last4: 'last4'
				}
			});

			t.htmlEqual( fixture.innerHTML, 'foobarfoobaz- a partialhello <div id="theid"><h1>hello plain partial</h1></div>nested onTheFly:plimpton last3' );

			ractive.push( 'items', { type: 'foo' } );
			ractive.set('test', 'b');
			ractive.set('last.one', function() { return 'wt'; });
			ractive.set('george', 'lazenby');
			ractive.set('last0', 'last2');

			t.htmlEqual( fixture.innerHTML, 'foobarfoobazfoo- b partialhello <div id="otherid"><h1>hello plain partial</h1></div>newted onTheFly:lazenby last4' );
		});

		test( 'Partials with expressions may also have context', function( t ) {
			var ractive = new Ractive({
				el: fixture,
				template: '{{>(tpl + ".test") ctx}} : {{>"test." + tpl ctx.expr}}',
				data: {
					ctx: { id: 1, expr: { id: 2 } },
					tpl: 'foo'
				},
				partials: {
					'test.foo': 'normal - {{.id}}',
					'foo.test': 'inverted - {{.id}}'
				}
			});

			t.htmlEqual( fixture.innerHTML, 'inverted - 1 : normal - 2');
		});
	};

});
