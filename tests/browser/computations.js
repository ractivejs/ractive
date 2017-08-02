import { hasUsableConsole, onWarn } from '../helpers/test-config';
import { initModule } from '../helpers/test-config';
import { test } from 'qunit';

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
		let bar = undefined;

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

			const ractive = new Widget({ el: fixture });

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
			},
			isolated: false
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
		const ractive = new Ractive({
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
		const count = { foo: 0, bar: 0, baz: 0, qux: 0 };

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
		const ractive = new Ractive({
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
		const called = { func: 0, f1: 0, f2: 0, f3: 0 };
		const ractive = new Ractive({
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

	test( 'reference expression proxy should play nicely with capture (#2550)', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with wat[idx]}}{{ident(.)}}{{/with}}`,
			computed: {
				wat() {
					return this.get('arr');
				}
			},
			data: {
				arr: [ 1, 2, 3 ],
				idx: 0,
				ident( v ) { return v; }
			}
		});

		t.htmlEqual( fixture.innerHTML, '1' );
		r.set( 'arr', [ 4, 5, 6 ]);
		t.htmlEqual( fixture.innerHTML, '4' );
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
		t.equal( count, 2 );
		t.htmlEqual( fixture.innerHTML, 'yep' );
		r.set( 'foo', [] );
		t.equal( count, 2 );
	});

	test( 'computations with a reference expression should update with the full reference too', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{foo[v].wat + '!'}}`,
			data: {
				foo: { bar: { wat: 'nope' } },
				v: 'bar'
			}
		});

		t.htmlEqual( fixture.innerHTML, 'nope!' );
		r.set( 'foo.bar.wat', 'yep' );
		t.htmlEqual( fixture.innerHTML, 'yep!' );
	});

	test( 'computations should not recompute when parent section is destroyed', t => {
		let count = 0;

		const ractive = new Ractive({
			el: fixture,

			template: `
			{{#if foo}}
			{{map[key]}}
			{{/if}}
			`,

			data: { key: 'x' },

			computed: {
				map () {
					this.get( 'foo' );
					count += 1;

					return { x: 'test' };
				}
			}
		});

		ractive.set( 'foo', true );
		t.equal( count, 1 );

		ractive.set( 'foo', false );
		t.equal( count, 1 );

		ractive.set( 'foo', true );
		t.equal( count, 2 );

		ractive.set( 'foo', false );
		t.equal( count, 2 );
	});

	test( 'computations should not recompute when parent component is destroyed', t => {
		let count = 0;

		const Foo = Ractive.extend({
			template: `{{map[key]}}`,

			data: () => ({
				key: 'x'
			}),

			computed: {
				map () {
					this.get( 'foo' );
					count += 1;

					return { x: 'test' };
				}
			}
		});

		const ractive = new Ractive({
			el: fixture,

			template: `
			{{#if foo}}
			<Foo foo='{{foo}}'/>
			{{/if}}
			`,

			components: { Foo }
		});

		ractive.set( 'foo', true );
		t.equal( count, 1 );

		ractive.set( 'foo', false );
		t.equal( count, 1 );

		ractive.set( 'foo', true );
		t.equal( count, 2 );

		ractive.set( 'foo', false );
		t.equal( count, 2 );
	});

	test( 'expressions in conditional branches should not be re-evaluated', t => {
		let count = 0;
		new Ractive({
			el: fixture,
			template: '{{#if comp()}}foo{{else}}bar{{/if}}',
			data: {
				comp () {
					count++;
					return true;
				}
			}
		});

		t.equal( count, 1 );
	});

	test( 'expressions should shuffle correctly', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each list}}{{.foo + 1}}{{~/list.0.foo + 1}}{{/each}}`,
			data: {
				list: [ { foo: 1 }, { foo: 2 } ]
			}
		});

		t.htmlEqual( fixture.innerHTML, '2232' );
		r.unshift( 'list', { foo: 3 } );
		t.htmlEqual( fixture.innerHTML, '442434' );
		r.splice( 'list', 1, 1 );
		t.htmlEqual( fixture.innerHTML, '4434' );
	});

	test( 'expressions with mappings shuffle correctly', t => {
		const cmp = Ractive.extend({
			template: '{{foo.foo + 1}}{{bar.foo + 1}}'
		});
		const r = new Ractive({
			el: fixture,
			template: `{{#each list}}<cmp foo="{{.}}" bar="{{~/list.0}}" />{{/each}}`,
			data: {
				list: [ { foo: 1 }, { foo: 2 } ]
			},
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, '2232' );
		r.unshift( 'list', { foo: 3 } );
		t.htmlEqual( fixture.innerHTML, '442434' );
		r.splice( 'list', 1, 1 );
		t.htmlEqual( fixture.innerHTML, '4434' );
	});

	test( 'computations update correctly during a shuffle', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{foo.foo}}{{foo.foo + 1}}',
			computed: {
				foo () {
					return this.get( 'list.0' );
				}
			},
			data: {
				list: [ { foo: 1 }, { foo: 2 } ]
			}
		});

		t.htmlEqual( fixture.innerHTML, '12' );
		r.unshift( 'list', { foo: 3 } );
		t.htmlEqual( fixture.innerHTML, '34' );
		r.shift( 'list' );
		t.htmlEqual( fixture.innerHTML, '12' );
	});

	test( `expression proxies shouldn't cause deps to re-order while handling changes from a mapping (#2678)`, t => {
		const cmp = Ractive.extend({
			template: '{{yield}}'
		});
		const r = new Ractive({
			el: fixture,
			template: `<cmp foo="{{#if .foo === 'yep'}}{{foo}}{{/if}}">{{.foo}}</cmp>-{{.foo}}`,
			data: { foo: 'foo' },
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, 'foo-foo' );
		r.set( 'foo', 'yep' );
		t.htmlEqual( fixture.innerHTML, 'yep-yep' );
	});

	test( `expression proxies shouldn't cause deps to re-order while handling any changes (#2680)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#foo(bat)}}{{#if . === 'nope'}}never{{/if}}{{#if ~/bat === 'yep'}}yep{{else}}hey{{/if}}{{/}}`,
			data: {
				foo ( str ) { return { str }; },
				bat: 'yep'
			}
		});

		t.htmlEqual( fixture.innerHTML, 'yep' );
		r.set( 'bat', 'hey' );
		t.htmlEqual( fixture.innerHTML, 'hey' );
	});

	test( `computation changes can be observed`, t => {
		t.expect( 3 );

		const r = new Ractive({
			data: {
				foo: 'bar'
			},
			computed: {
				bar: {
					get () { return this.get( 'foo' ) + 'bar'; },
					set ( val ) {
						this.set( 'foo', val.replace( /bar$/, '' ) );
					}
				}
			}
		});

		t.equal( r.get( 'bar' ), 'barbar' );

		let expected = 'foobar';
		r.observe( 'bar', v => {
			t.ok( v === expected );
		}, { init: false } );
		r.set( 'foo', 'foo' );

		expected = 'goofbar';
		r.set( 'bar', 'goof' );
	});

	test( `computation changes are included in recursive observers`, t => {
		t.expect( 2 );

		let fluff = 'bar';
		const r = new Ractive({
			el: fixture,
			template: '{{bar}}',
			data: {
				foo: 'bar'
			},
			computed: {
				bar: {
					get () {
						return this.get( 'foo' ) + fluff;
					},
					set ( val ) {
						fluff = val;
					}
				}
			}
		});

		let expected;
		r.observe( '**', ( c, o, k ) => {
			if ( k === 'bar' ) {
				t.ok( c === expected, `"${c}" === "${expected}"` );
			}
		}, { init: false });

		expected = 'foobar';
		r.set( 'foo', 'foo' );

		expected = 'foogoof';
		r.set( 'bar', 'goof' );
	});

	test( `computations can have child values set when allowed`, t => {
		const r = new Ractive({
			target: fixture,
			template: `
				{{#each foo}}<i>{{.a}}</i>{{/each}}
				{{#each foos()}}<i>{{.a}}</i>{{/each}}
				{{#each list}}<i>{{.a}}</i>{{/each}}
			`,
			data: {
				list: [ { a: 1 } ],
				foos() { return this.get( 'list' ); }
			},
			computed: {
				foo: {
					get() { return this.get( 'list' ); }
				}
			},
			syncComputedChildren: true
		});

		t.htmlEqual( fixture.innerHTML, '<i>1</i><i>1</i><i>1</i>' );

		const [ c, e ] = r.findAll( 'i' ).map( r.getContext );

		c.set( '.a', 2 );
		t.htmlEqual( fixture.innerHTML, '<i>2</i><i>2</i><i>2</i>' );

		e.set( '.a', 3 );
		t.htmlEqual( fixture.innerHTML, '<i>3</i><i>3</i><i>3</i>' );
	});

	test( `computations with dotted names can be accessed (#2807)`, t => {
		const r = new Ractive({
			computed: {
				'foo.bar': '${baz} + 1'
			},
			data: { baz: 1 }
		});
		let val = 2;
		r.observe( 'foo\\.bar', v => t.equal( v, val ) );

		t.equal( r.get( 'foo\\.bar' ), 2 );

		val = 10;
		r.set( 'baz', 9 );
		t.equal( r.get( 'foo\\.bar' ), 10 );
	});

	test( `computations that return objects fire with recursive observers`, t => {
		t.expect( 2 );

		const r = new Ractive({
			target: fixture,
			template: '{{foo}}',
			computed: {
				foo() {
					return { bar: this.get( 'bar' ), baz: this.get( 'baz' ) };
				}
			},
			data: { bar: { bat: true }, baz: 42 }
		});

		const result = { bar: { bat: 'yep' }, baz: 42 };

		r.observe( '**', ( n, o, k ) => {
			if ( k === 'foo' ) t.deepEqual( n, result );
		}, { init: false });

		r.set( 'bar.bat', 'yep' );

		result.baz = 999;

		r.set( 'baz', 999 );
	});

	test( `computeds with setters should call the set when updated (#3006)`, t => {
		t.expect( 7 );

		const obj = { foo: false };
		let count = 0;

		const r = new Ractive({
			computed: {
				foo: {
					get () {
						count++;
						return obj;
					},
					set ( val ) {
						t.ok( val === obj );
						return;
					}
				}
			}
		});

		t.equal( r.get( 'foo.foo' ), false );
		t.equal( count, 1 );
		t.equal( r.get( 'foo.foo' ), false );
		t.equal( count, 1 );
		r.set( 'foo.foo', true );
		t.equal( r.get( 'foo.foo' ), true );
		t.equal( count, 2 );
	});

	test( `expressions don't cause themselves to invalidate and leave already updated items dirty`, t => {
		// NOTE: this test doesn't quite reproduce the original issue, which was caused by repeated fragment children bubbling during a bubbled update
		const r = new Ractive({
			target: fixture,
			template: `{{#each items}}{{#unless .bool}}{{>part}}{{/unless}}{{/each}}`,
			data: {
				items: [ { bool: false }, { bool: false }, { bool: false } ],
				selected: 0
			},
			partials: {
				part: '<span class-selected="~/selected === @index" />'
			}
		});

		t.htmlEqual( fixture.innerHTML, '<span class="selected"></span><span></span><span></span>' );

		r.set( 'selected', 1 );
		t.htmlEqual( fixture.innerHTML, '<span wat></span><span class="selected"></span><span></span>' );

		r.set( 'selected', 0 );
		t.htmlEqual( fixture.innerHTML, '<span class="selected"></span><span></span><span></span>' );
	});

	// phantom just doesn't execute this test... no error, just nothing
	// even >>> log messages don't come out. passes chrome and ff, though
	if ( !/phantom/i.test( navigator.userAgent ) ) {
		test( `various spread expressions compute correctly`, t => {
			new Ractive({
				el: fixture,
				template: `{{ JSON.stringify([ foo, bar, ...baz, ...bat( { bip, bop: 42, ...whimmy.wham( ...[ zat, wozzle, ...qux, bar ], zip ), bif: 84 } ), bar, foo ]) }}`,
				data: {
					foo: 1,
					bar: 2,
					baz: [ 'a', 'b', 'c' ],
					bat ( obj ) { return [ obj, 123 ]; },
					bip: 99,
					whimmy: {
						wham ( ...args ) {
							return args.slice(2).reduce( ( a, c, i ) => {
								a[ i + 'a' ] = c;
								return a;
							}, {} );
						}
					},
					zat: true,
					wozzle: false,
					qux: [ 'z', 26, 'y', 25 ],
					zip: 'zip'
				}
			});

			t.htmlEqual( fixture.innerHTML, `[1,2,"a","b","c",{"bip":99,"bop":42,"0a":"z","1a":26,"2a":"y","3a":25,"4a":2,"5a":"zip","bif":84},123,2,1]` );
		});
	}
}
