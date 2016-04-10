import { test } from 'qunit';
import { hasUsableConsole, onWarn } from './test-config';
import { initModule } from './test-config';

export default function() {
	initModule( 'computations.js' );

	test( 'Computed value declared as a function', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<p>area: {{area}}</p>',
			data: {
				width: 10,
				height: 10
			},
			computed: {
				area () {
					return this.get( 'width' ) * this.get( 'height' );
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, '<p>area: 100</p>' );

		ractive.set( 'width', 15 );
		t.htmlEqual( fixture.innerHTML, '<p>area: 150</p>' );

		ractive.set( 'height', 15 );
		t.htmlEqual( fixture.innerHTML, '<p>area: 225</p>' );
	});

	test( 'Dependency of computed property', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{answer}}',
			data: {
				foo: { bar: { qux: 1 } },
				number: 10
			},
			computed: {
				answer: '${foo.bar.qux} * ${number}'
			}
		});

		t.htmlEqual( fixture.innerHTML, '10' );

		ractive.set( 'foo.bar.qux', 2 );
		t.htmlEqual( fixture.innerHTML, '20' );

		ractive.set( 'foo.bar', { qux: 3 } );
		t.htmlEqual( fixture.innerHTML, '30' );

		ractive.set( 'foo', { bar: { qux: 4 } } );
		t.htmlEqual( fixture.innerHTML, '40' );
	});

	test( 'Computed value declared as a string', t => {
		const ractive = new Ractive({
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

	test( 'Computed value with a set() method', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<p>First name: {{first}}</p><p>Last name: {{last}}</p><p>Full name: {{full}}</p>',
			data: {
				first: 'Jim',
				last: 'Beam'
			},
			computed: {
				full: {
					get: '${first} + " " + ${last}',
					set ( fullname ) {
						const parts = fullname.split( ' ' );

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

	test( 'Components can have default computed properties', t => {
		const Box = Ractive.extend({
			template: '<div style="width: {{width}}px; height: {{height}}px;">{{area}}px squared</div>',
			computed: {
				area: '${width} * ${height}'
			}
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Box width="{{width}}" height="{{height}}"/>',
			data: {
				width: 100,
				height: 100
			},
			components: { Box }
		});

		// once again... phantom trailing space in style... sometimes
		t.htmlEqual( fixture.innerHTML.replace( /\s+/g, '' ), `<div style="width: 100px; height: 100px;">10000px squared</div>`.replace( /\s+/g, '' ) );

		ractive.set( 'width', 200 );
		t.htmlEqual( fixture.innerHTML.replace( /\s+/g, '' ), `<div style="width: 200px; height: 100px;">20000px squared</div>`.replace( /\s+/g, '' ) );
	});

	test( 'Instances can augment default computed properties of components', t => {
		const Box = Ractive.extend({
			template: '<div style="width: {{width}}px; height: {{height}}px;">{{area}}px squared</div>',
			computed: {
				area: '${width} * ${height}'
			}
		});

		const ractive = new Box({
			el: fixture,
			data: {
				width: 100,
				height: 100
			},
			computed: { irrelevant: '"foo"' }
		});

		// phantom sometimes leaves a trailing space in the style... can't make this crap up
		t.htmlEqual( fixture.innerHTML.replace( /\s+/g, '' ), `<div style="width: 100px; height: 100px;">10000px squared</div>`.replace( /\s+/g, '' ) );

		ractive.set( 'width', 200 );
		t.htmlEqual( fixture.innerHTML.replace( /\s+/g, '' ), `<div style="width: 200px; height: 100px;">20000px squared</div>`.replace( /\s+/g, '' ) );
	});

	test( 'Computed values can depend on other computed values', t => {
		const ractive = new Ractive({
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

	test( 'Computed values with mix of computed and non-computed dependencies updates when non-computed dependencies change (#2228)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{number}}',
			data: {
				a: 40,
				b: 0
			},
			computed: {
				yes () {
					return true;
				},

				number () {
					return this.get( 'yes' ) ? ( this.get( 'a' ) + this.get( 'b' ) ) : 99;
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, '40' );

		ractive.set( 'b', 2 );
		t.htmlEqual( fixture.innerHTML, '42' );
	});

	test( 'Computations that cause errors are considered undefined', t => {
		onWarn( () => {} ); // suppress

		const ractive = new Ractive({
			el: fixture,
			template: '{{uppercaseBar}}',
			computed: {
				uppercaseBar: '${foo}.bar.toUpperCase()'
			}
		});

		t.htmlEqual( fixture.innerHTML, '' );

		ractive.set( 'foo.bar', 'works' );
		t.htmlEqual( fixture.innerHTML, 'WORKS' );
	});

	test( 'Computations can be updated with ractive.update() (#651)', t => {
		let bar;

		const ractive = new Ractive({
			computed: {
				foo () {
					return bar;
				}
			}
		});

		t.equal( ractive.get( 'foo' ), undefined );

		bar = 1;
		ractive.update( 'foo' );
		t.equal( ractive.get( 'foo' ), 1 );
	});

	test( 'Regression test for #836', t => {
		const Widget = Ractive.extend({
			template: '{{# foo <= bar }}yes{{/}}',
			computed: { foo: '[]' },
			oninit () {
				this.set({ bar: 10 });
			}
		});

		new Ractive({
			el: fixture,
			template: '<Widget/>',
			components: { Widget }
		});

		t.htmlEqual( fixture.innerHTML, 'yes' );
	});

	test( 'Setters are called on init with supplied data (#837)', t => {
		new Ractive({
			el: fixture,
			template: '{{firstname}}',
			computed: {
				fullname: {
					set ( fullname ) {
						const split = fullname.split( ' ' );
						this.set({
							firstname: split[0],
							lastname: split[1]
						});
					},
					get () {
						return this.get( 'firstname' ) + ' ' + this.get( 'lastname' );
					}
				}
			},
			data: {
				fullname: 'Colonel Sanders'
			}
		});

		t.htmlEqual( fixture.innerHTML, 'Colonel' );
	});

	test( 'Set operations are not short-circuited when the set value is identical to the current get value (#837)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{bar}}',
			data: {
				bar: 1
			},
			computed: {
				foo: {
					get () {
						return this.get( 'bar' );
					},
					set ( value ) {
						this.set( 'bar', value + 1 );
					}
				}
			}
		});

		ractive.set( 'foo', 1 );
		t.htmlEqual( fixture.innerHTML, '2' );
	});

	if ( hasUsableConsole ) {
		test( 'Computations on unresolved refs don\'t error on initial component bindings', t => {
			t.expect( 0 );

			onWarn( () => t.ok( false ) );

			new Ractive({
				template: '<component/>',
				components: {
					component: Ractive.extend({
						debug: true,
						computed: {
							foo: '${bar}'
						}
					})
				}
			});
		});

		test( 'Computed value that calls itself (#1359)', t => {
			let messages = 0;

			onWarn( msg => {
				if ( /computation indirectly called itself/.test( msg ) ) {
					messages += 1;
				}
			});

			const Widget = Ractive.extend({
				template: `
					{{sort(headers)}}

					{{#sort(rows)}}
						<p>{{id}} - {{name}}</p>
					{{/rows}}`,
				data: {
					headers: [],
					rows: [
						{ id : 1, name: 'a' },
						{}
					],
					sort ( arr ) {
						return arr.sort( ( a, b ) => a.id - b.id );
					}
				}
			});

			let ractive = new Widget({ el: fixture });

			ractive.reset();
			ractive.update();

			t.equal( messages, 0 );
			t.htmlEqual( fixture.innerHTML, '<p>1 - a</p><p> - </p>' );
		});
	}


	test( 'Unresolved computations resolve when parent component data exists', t => {
		const Component = Ractive.extend({
			template: '{{FOO}} {{BAR}}',
			computed: {
				FOO: '${foo}.toUpperCase()',
				BAR () {
					return this.get( 'bar' ).toUpperCase();
				}
			}
		});

		new Ractive({
			el: fixture,
			template: '<Component/>',
			data: {
				foo: 'fee fi',
				bar: 'fo fum'
			},
			components: { Component }
		});

		t.equal( fixture.innerHTML, 'FEE FI FO FUM' );

	});

	test( 'Computed properties referencing bound parent data', t => {
		const List = Ractive.extend({
			template: `{{limits.sum}}`,
			computed: {
				limits () {
					return {
						sum: this.get( 'd.opts' ).reduce( ( a, b ) => a + b )
					};
				}
			}
		});

		new Ractive({
			el: fixture,
			template: `
				{{#each list}}
					<List d='{{.}}'/>
				{{/each list}}`,
			data: {
				list: [
					{ opts: [ 3, 3, 3 ] },
					{ opts: [ 3, 2, 1 ] },
					{ opts: [ 1, 1, 1 ] }
				]
			},
			components: { List }
		});

		t.equal( fixture.innerHTML, '963' );
	});

	test( 'Computed properties referencing bound parent data w/ conditional', t => {
		const List = Ractive.extend({
			template: `
				{{#if limits.sum}}
					{{limits.sum}}
				{{else}}
					x
				{{/if}}`,
			computed: {
				limits () {
					return {
						sum: this.get( 'd.opts' ).reduce( ( a, b ) => a + b )
					};
				}
			}
		});

		new Ractive({
			el: fixture,
			template: `
				{{#each list}}
					<List d='{{.}}'/>
				{{/each}}`,
			data: {
				list: [
					{ opts: [ 3, 3, 3 ] },
					{ opts: [ 3, 2, 1 ] },
					{ opts: [ 1, 1, 1 ] }
				]
			},
			components: { List }
		});

		t.equal( fixture.innerHTML, '963' );
	});

	test( 'Computed properties referencing deep objects', t => {
		let ractive = new Ractive({
			el: fixture,
			template: '{{one.two.tre}}',
			data: {
				answer: 42
			},
			computed: {
				one () {
					return {
						two: {
							tre: this.get( 'answer' )
						}
					};
				}
			}
		});

		t.equal( fixture.innerHTML, '42' );
		ractive.set( 'answer', 99 );
		t.equal( fixture.innerHTML, '99' );
	});

	test( 'Computations are not order dependent', t => {

		const Component = Ractive.extend({
			template: '{{foo}}',
			data: {
				count: 1
			},
			computed: {
				foo: '${bar} + 1',
				bar: '${count} + 1'
			}
		});

		new Ractive({
			el: fixture,
			template: '<Component/>',
			data: {
				bar: 20
			},
			components: { Component }
		});
		t.equal( fixture.innerHTML, '3' );

	});

	test( 'Parent extend instance computations are resolved before child computations', t => {
		const Base = Ractive.extend({
			computed: {
				base: () => 1
			}
		});

		const Component = Base.extend({
			template: '{{foo}}',
			computed: {
				foo: '${base} + 1'
			}
		});

		new Ractive({
			el: fixture,
			template: '<Component/>',
			components: { Component }
		});

		t.equal( fixture.innerHTML, '2' );
	});

	test( 'Computed values are only computed as necessary', t => {
		let count = { foo: 0, bar: 0, baz: 0, qux: 0 };

		const ractive = new Ractive({
			el: fixture,
			template: '{{bar}}',
			data: {
				str: 'this is a string'
			},
			computed: {
				foo () {
					count.foo += 1;
					return this.get( 'baz' ).toUpperCase();
				},
				baz () {
					count.baz += 1;
					return this.get( 'str' ).replace( /string/i, 'computation' );
				},
				bar () {
					count.bar += 1;
					return this.get( 'foo' ) + '//' + this.get( 'foo' );
				},
				qux () {
					count.qux += 1;
					return 'whatever';
				}
			}
		});

		t.deepEqual( count, { foo: 1, bar: 1, baz: 1, qux: 0 });

		ractive.get( 'qux' );
		t.deepEqual( count, { foo: 1, bar: 1, baz: 1, qux: 1 });

		ractive.set( 'str', 'how long is a piece of string' );
		t.equal( fixture.innerHTML, 'HOW LONG IS A PIECE OF COMPUTATION//HOW LONG IS A PIECE OF COMPUTATION' );
		t.deepEqual( count, { foo: 2, bar: 2, baz: 2, qux: 1 });

		ractive.set( 'str', 'How Long Is A Piece Of String' );
		t.deepEqual( count, { foo: 3, bar: 3, baz: 3, qux: 1 });
	});

	test( 'What happens if you access a computed property in data config?', t => {
		new Ractive({
			el: fixture,
			template: '{{total}}',
			onconfig () {
				return this.set( 'total', this.get( 'add' ) );
			},
			computed: {
				add: '5'
			}
		});

		t.equal( fixture.innerHTML, '5' );
	});

	test( 'Computations matching _[0-9]+ that are not references should not be mangled incorrectly for caching', t => {
		new Ractive({
			el: fixture,
			template: '{{ foo["_1bar"] }} {{ foo["_2bar"] }}',
			data: { foo: { _1bar: 1, _2bar: 2 } }
		});

		t.htmlEqual( fixture.innerHTML, '1 2' );

		new Ractive({
			el: fixture,
			template: `{{ foo(bar, '_0') }} {{ foo(bar, '_1') }}`,
			data: { foo( a, b ) { return b; }, bar: 'ignored' }
		});

		t.htmlEqual( fixture.innerHTML, '_0 _1' );
	});

	test( 'Computations can depend on array values (#1747)', t => {
		let ractive = new Ractive({
			el: fixture,
			template: '{{count}} {{count === 4}}',
			data: {
				items: [ 1, 2, 3 ]
			},
			computed: {
				count: '${items}.length'
			}
		});

		t.htmlEqual( fixture.innerHTML, '3 false' );
		ractive.push( 'items', 4 );
		t.htmlEqual( fixture.innerHTML, '4 true' );
	});

	// Commented out temporarily, see #1381
	/*test( 'Computations don\'t mistakenly set when used in components (#1357)', t => {
		var ractive, Component;

		Component = Ractive.extend({
			template: "{{ a }}:{{ b }}",
			computed: {
				b: function() {
					var a = this.get("a");
					return a + "bar";
				}
			}
		});

		ractive = new Ractive({
			el: fixture,
			template: '{{ a }}:{{ b }}-<component a="{{ a }}" b="{{ b }}" />',
			components: {
				component: Component
			},
			data: {
				a: "foo"
			}
		});

		t.equal( fixture.innerHTML, 'foo:foobar-foo:foobar' );
	});*/

	test( 'Computations depending up computed values cascade while updating (#1383)', ( t ) => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#if a < 10}}less{{else}}more{{/if}}',
			data: {
				b: { c: 0 }
			},
			computed: {
				a () { return this.get('b').c; }
			}
		});

		t.equal( fixture.innerHTML, 'less' );
		ractive.set( 'b.c', 100 );
		t.equal( fixture.innerHTML, 'more' );
	});

	test( 'Setting an Array to [] does not recompute removed values (#2069)', t => {
		let called = { func: 0, f1: 0, f2: 0, f3: 0 };
		let ractive = new Ractive({
			el: fixture,
			template: `
				<ul>
					{{#each items}}
						<li>{{ func(this) }}-{{ this.f() }}</li>
					{{/each}}
				</ul>`,
			data: () => ({
				items: [
					{ f () { called.f1++; return 'f1'; } },
					{ f () { called.f2++; return 'f2'; } },
					{ f () { called.f3++; return 'f3'; } }
				],
				func ( obj ) { called.func++; return obj; }
			})
		});

		t.deepEqual( called, { func: 3, f1: 1, f2: 1, f3: 1 });
		ractive.set('items', []);
		t.deepEqual( called, { func: 3, f1: 1, f2: 1, f3: 1 });
	});

	test( 'ComputationChild dependencies are captured (#2132)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				{{#each items}}
					<p>{{this}}/{{getItem(this)}}</p>
				{{/each}}`,
			data: {
				odd: true,
				getItem ( n ) {
					return n;
				}
			},
			computed: {
				items () {
					return this.get( 'odd' ) ? [ 'a', 'b', 'c' ] : [ 'd', 'e' ];
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, '<p>a/a</p><p>b/b</p><p>c/c</p>' );
		ractive.toggle( 'odd' );
		t.htmlEqual( fixture.innerHTML, '<p>d/d</p><p>e/e</p>' );
	});

	test( 'ExpressionProxy should notify its deps when it resolves (#2214)', t => {
		const r = new Ractive({
			el: fixture,
			template: '-{{#with foo}}{{#if bar[0] && bar[0] === bar[1]}}ok{{/if}}{{/with}}',
			data: {
				foo: { x: 1 }
			}
		});

		t.htmlEqual( fixture.innerHTML, '-' );

		r.set( 'bar', [ 1, 1 ] );

		t.htmlEqual( fixture.innerHTML, '-ok' );
	});

	test( 'writable ComputationChild should find its computation if it is directly attached', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#some.foo()}}{{.bar}}{{/}}',
			derivedBindings: true,
			data: { obj: { bar: 'yep' } }
		});

		r.set( 'some.foo', function() { return r.get( 'obj' ); } );

		t.equal( fixture.innerHTML, 'yep' );

		r.set( '#some\\.foo().bar', 'baz' );

		t.equal( fixture.innerHTML, 'baz' );
	});

	test( 'writable ComputationChild should find its computation if it is not an expression', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{obj.bar}}',
			derivedBindings: true,
			data: { obj: { bar: 'yep' } },
			computed: {
				foo() { return this.get('obj'); }
			}
		});

		t.equal( fixture.innerHTML, 'yep' );

		r.set( 'foo.bar', 'baz' );

		t.equal( fixture.innerHTML, 'baz' );
	});

	test( 'computations should be stored at their escaped path so that they can be looked up from a normalized split path', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#some.foo()}}<span>{{.bar}}</span><button on-click="go(event)">click me</button>{{/}}',
			derivedBindings: true,
			data: { obj: { bar: 'yep' } },
			go( ev ) {
				this.set( `${ev.keypath}.bar`, 'baz' );
			}
		});

		r.set( 'some.foo', function() { return r.get( 'obj' ); } );

		t.equal( r.find( 'span' ).innerHTML, 'yep' );

		r.find( 'button' ).click();

		t.equal( r.find( 'span' ).innerHTML, 'baz' );
	});

	test( 'computations should not recompute when spliced out', t => {
		let count = 0;

		const r = new Ractive({
			el: fixture,
			template: `{{#each foo}}{{ check(.) ? 'yep ' : 'nope ' }}{{/each}}`,
			data: {
				foo: [ 1, 20 ],
				check(n) {
					count++;
					return n > 10;
				}
			}
		});

		t.htmlEqual( fixture.innerHTML, 'nope yep' );
		t.equal( count, 2 );
		r.splice( 'foo', 0, 1 );
		t.equal( count, 3 );
		t.htmlEqual( fixture.innerHTML, 'yep' );
		r.set( 'foo', [] );
		t.equal( count, 3 );
	});
}
