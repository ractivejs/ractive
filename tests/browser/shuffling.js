import { fire } from 'simulant';
import { initModule } from '../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'shuffling.js' );

	test( 'Pattern observers on arrays fire correctly after mutations (mirror of test in observe.js)', t => {
		const ractive = new Ractive({
			data: {
				items: [ 'a', 'b', 'c' ]
			}
		});

		let lastKeypath;
		let lastValue;
		let observedLengthChange = false;

		ractive.observe( 'items.*', ( n, o, k ) => {
			lastKeypath = k;
			lastValue = n;

			if ( k === 'items.length' ) {
				observedLengthChange = true;
			}
		}, { init: false });

		ractive.push( 'items', 'd' );
		t.equal( lastKeypath, 'items.3' );
		t.equal( lastValue, 'd' );

		ractive.pop( 'items' );
		// TODO this appears to directly contradict related tests in observe.js???
		// t.equal( lastKeypath, 'items.3' );
		// t.equal( lastValue, undefined );

		t.ok( !observedLengthChange );

		ractive.set( 'items.length', 4 );
		t.ok( observedLengthChange );
	});

	test( '#if sections only render once when arrays are mutated', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#if list}}yes{{else}}no{{/if}}',
			data: {
				list: [ 'a', 'b', 'c' ]
			}
		});

		t.htmlEqual( fixture.innerHTML, 'yes' );

		ractive.push( 'list', 'd' );
		t.htmlEqual( fixture.innerHTML, 'yes' );

		ractive.splice( 'list', 0, 0, 'e', 'f' );
		t.htmlEqual( fixture.innerHTML, 'yes' );
	});

	test( 'an appropriate error is thrown when shuffling a non-array keypath', t => {
		const r = new Ractive({
			data: { foo: null }
		});

		t.throws( () => {
			r.push('foo', 1);
		}, /.*push.*non-array.*foo.*/i);
	});

	test( 'conditional attributes shuffle correctly', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#each items}}<div {{#if .cond}}foo="{{.bar}}"{{/if}}>yep</div>{{/each}}',
			data: {
				items: [ { cond: true, bar: 'baz' } ]
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div foo="baz">yep</div>' );
		r.unshift( 'items', { cond: true, bar: 'bat' } );
		t.htmlEqual( fixture.innerHTML, '<div foo="bat">yep</div><div foo="baz">yep</div>' );
	});

	test( 'yielders shuffle correctly', t => {
		const cmp = Ractive.extend({
			template: '{{yield}}'
		});

		const r = new Ractive({
			el: fixture,
			components: { cmp },
			template: '{{#each items}}<cmp>{{.bar}}</cmp>{{/each}}',
			data: {
				items: [ { bar: 'baz' } ]
			}
		});

		t.htmlEqual( fixture.innerHTML, 'baz' );
		r.unshift( 'items', { bar: 'bat' } );
		t.htmlEqual( fixture.innerHTML, 'batbaz' );
	});

	test( 'event directives should shuffle correctly', t => {
		t.expect( 5 );

		const r = new Ractive({
			el: fixture,
			template: '{{#each items}}<div id="div{{@index}}" on-click="@this.fire("foo", event, .bar)" />{{/each}}',
			data: {
				items: [ { bar: 'baz' } ]
			}
		});

		const listener = r.on( 'foo', ( ev, bar ) => {
			t.equal( r.get( 'items.0.bar' ), bar );
		});

		fire( r.find( '#div0' ), 'click' );
		r.unshift( 'items', { bar: 'bat' } );
		fire(  r.find( '#div0' ), 'click' );

		listener.cancel();

		r.on( 'foo', ev => {
			t.equal( ev.resolve(), 'items.1' );
		});

		fire( r.find( '#div1' ), 'click' );

		r.push( 'items', {} );
		r.splice( 'items', 0, 1 );
		t.equal( r.findAll( 'div' )[ 1 ].id, 'div1' );

		fire( r.find( '#div1' ), 'click' );
	});

	test( 'method event directives should shuffle correctly', t => {
		t.expect( 9 );

		let group = 0;

		const r = new Ractive({
			el: fixture,
			template: '{{#each items}}<div id="div{{@index}}" on-click="@this.foo(@keypath, .bar)" />{{/each}}',
			data: {
				items: [ { bar: 'baz' } ]
			},
			foo( path, bar ) {
				if ( group === 0 ) {
					t.equal( bar, r.get( 'items.0.bar' ) );
					t.equal( path, 'items.0' );
				} else {
					t.equal( path, 'items.1' );
					t.equal( this.event.resolve(), 'items.1' );
				}
			}
		});

		const listener = r.on( 'foo', ( path ) => {
			t.equal( r.get( 'items.0' ), path );
		});

		fire( r.find( '#div0' ), 'click' );
		r.unshift( 'items', { bar: 'bar' } );
		fire(  r.find( '#div0' ), 'click' );

		listener.cancel();

		group = 1;

		fire( r.find( '#div1' ), 'click' );

		r.push( 'items', {} );
		r.splice( 'items', 0, 1 );
		t.equal( r.findAll( 'div' )[ 1 ].id, 'div1' );

		fire( r.find( '#div1' ), 'click' );
	});

	test( 'method event directives with no args should shuffle without throwing', t => {
		t.expect( 0 );

		const r = new Ractive({
			el: fixture,
			template: '{{#each items}}<button on-click="@this.foo()">clickme</button>{{/each}}',
			data: { items: [ 1 ] }
		});

		r.unshift( 'items', 2 );
	});

	test( 'shuffling around a computation with an index ref', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items.slice(1)}}{{2 * @index}} {{@index * .}}|{{/each}}`,
			data: {
				items: [ 1, 2 ]
			}
		});

		t.htmlEqual( fixture.innerHTML, '0 0|' );
		r.splice( 'items', 1, 0, 3, 4 );
		t.htmlEqual( fixture.innerHTML, '0 0|2 4|4 4|' );
		r.splice( 'items', 0, 1 );
		t.htmlEqual( fixture.innerHTML, '0 0|2 2|' );
	});

	test( 'shuffling a computation should not cause the computation to shuffle (#2267 #2269)', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items.slice(1)}}{{.}}{{/each}}`,
			data: {
				items: [ 1, 2 ]
			}
		});

		t.htmlEqual( fixture.innerHTML, '2' );
		r.splice( 'items', 0, 1 );
		t.htmlEqual( fixture.innerHTML, '' );
	});

	test( 'shuffled sections that unrender at the same time should not leave orphans (#2277)', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#if items.length}}{{#each items}}{{.}}{{/each}}{{/if}}`,
			data: {
				items: [ 1 ]
			}
		});

		t.htmlEqual( fixture.innerHTML, '1' );
		r.splice( 'items', 0, 1 );
		t.htmlEqual( fixture.innerHTML, '' );
	});

	test( `shuffled elements with attributes depending on template context (@index, etc) should have appropriately updated attributes (#2422)`, t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each foo}}<span data-wat="{{50 * @index}}">{{50 * @index}}</span>{{/each}}`,
			data: { foo: [ 0, 0, 0 ] }
		});

		r.push( 'foo', 0 );

		let spans = r.findAll( 'span' );

		for ( let i = 0; i < spans.length; i++ ) t.equal( spans[i].getAttribute( 'data-wat' ), spans[i].innerHTML );

		r.splice( 'foo', 2, 1 );
		r.splice( 'foo', 1, 0, 0 );
		spans = r.findAll( 'span' );

		for ( let i = 0; i < spans.length; i++ ) t.equal( spans[i].getAttribute( 'data-wat' ), spans[i].innerHTML );
	});

	test( 'computations with reference expressions that resolve to an array length should be marked on shuffle (#2541)', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{foo[v].length + 1}}',
			data: {
				foo: { bar: [ 1, 2 ] },
				v: 'bar'
			}
		});

		t.htmlEqual( fixture.innerHTML, '3' );
		r.push( 'foo.bar', 3 );
		t.htmlEqual( fixture.innerHTML, '4' );
	});

	test( 'shuffled computations are updated with their shuffled member', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each list as item:i}}{{item + i}}{{/each}}`,
			data: {
				list: [ 1 ]
			}
		});

		t.htmlEqual( fixture.innerHTML, '1' );
		r.unshift( 'list', 2 );
		t.htmlEqual( fixture.innerHTML, '22' );
		r.set( 'list.1', 10 );
		t.htmlEqual( fixture.innerHTML, '211' );
	});

	test( 'children of shuffled reference expressions survive the shuffle', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#each lists[name]}}{{.foo}}{{/each}}',
			data: {
				lists: {
					list: [ { foo: 'bar' } ]
				},
				name: 'list'
			}
		});

		t.htmlEqual( fixture.innerHTML, 'bar' );
		r.unshift( 'lists.list', { foo: 'foo' } );
		t.htmlEqual( fixture.innerHTML, 'foobar' );
		r.set( 'lists.list.1.foo', 'baz' );
		t.htmlEqual( fixture.innerHTML, 'foobaz' );
	});

	test( 'reference expression members shuffle safely', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#each lists[name.0]}}{{.foo}}{{/each}}',
			data: {
				lists: {
					list: [ { foo: 'bar' } ],
					other: [ { foo: 'baz' } ]
				},
				name: [ 'list', 'other' ]
			}
		});

		t.htmlEqual( fixture.innerHTML, 'bar' );
		r.shift( 'name' );
		t.htmlEqual( fixture.innerHTML, 'baz' );
		r.set( 'lists.other.0.foo', 'bat' );
		t.htmlEqual( fixture.innerHTML, 'bat' );
	});

	// TODO reinstate this in some form. Commented out for purposes of #1740
	//test( `Array shuffling only adjusts context and doesn't tear stuff down to rebuild it`, t => {
	// 	let ractive = new Ractive({
	// 		el: fixture,
	// 		template: '{{#each items}}{{.name}}{{.name + "_expr"}}{{.[~/name]}}<span {{#.name}}ok{{/}} class="{{.name}}">{{.name}}</span>{{/each}}',
	// 		data: { items: [ { name: 'foo' } ], name: 'name' }
	// 	});

	// 	t.htmlEqual( fixture.innerHTML, 'foofoo_exprfoo<span ok class="foo">foo</span>' );

	// 	let iter = ractive.fragment.items[0].fragments[0],
	// 		ref = iter.items[0],
	// 		exp = iter.items[1],
	// 		mem = iter.items[2],
	// 		el = iter.items[3];

	// 	// make sure these little suckers don't get re-rendered
	// 	ref.node.data += 'a';
	// 	exp.node.data += 'b';
	// 	mem.node.data += 'c';

	// 	ractive.unshift( 'items', { name: 'bar' } );

	// 	t.htmlEqual( fixture.innerHTML, 'barbar_exprbar<span ok class="bar">bar</span>fooafoo_exprbfooc<span ok class="foo">foo</span>' );

	// 	let shifted = ractive.fragment.items[0].fragments[1];
	// 	t.strictEqual( iter, shifted );
	// 	t.strictEqual( ref, shifted.items[0]);
	// 	t.strictEqual( exp, shifted.items[1]);
	// 	t.strictEqual( mem, shifted.items[2]);
	// 	t.strictEqual( el, shifted.items[3]);
	// });

	function removedElementsTest ( action, fn ) {
		test( `Array elements removed via ${action} do not trigger updates in removed sections`, t => {
			let observed = false;
			let errored = false;

			t.expect( 5 );

			const ractive = new Ractive({
				debug: true,
				el: fixture,
				template: '{{#options}}{{get(this)}}{{/options}}',
				data: {
					options: [ 'a', 'b', 'c' ],
					get ( item ){
						if (!item ) errored = true;
						return item;
					}
				}
			});

			ractive.observe( 'options.2', ( n, o ) => {
				t.ok( !n );
				t.equal( o, 'c' );
				observed = true;
			}, { init: false } );

			t.ok( !observed );

			fn( ractive );

			t.ok( observed );
			t.ok( !errored );
		});
	}

	removedElementsTest( 'splice', ractive => ractive.splice( 'options', 1, 1 ) );
	removedElementsTest( 'merge', ractive => ractive.set( 'options', [ 'a', 'c' ], { shuffle: true } ) );

	test( `mapped unresolved computations should shuffle correctly (#2602)`, t => {
		const cmp = Ractive.extend({
			template: '{{foo.baz || 1}}-{{foo.bar}}|'
		});
		const r = new Ractive({
			el: fixture,
			template: `{{#each list}}<cmp foo="{{.}}" />{{/each}}`,
			data: {
				list: [ { bar: 1 }, { bar: 2 }, { bar: 3 } ]
			},
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, '1-1|1-2|1-3|' );
		r.splice( 'list', 0, 0, r.splice( 'list', 2, 1 ).result[0] );
		r.findAllComponents()[1].set( 'foo.baz', 10 );
		t.htmlEqual( fixture.innerHTML, '1-3|10-1|1-2|' );
	});

	test( 'pattern observers should shuffle correctly (#2601)', t => {
		let count = 0;
		const cmp = Ractive.extend({
			template: '{{foo.bar}}',
			onconfig () {
				this.observe( 'foo.*', v => {
					count++;
					t.equal( v, 'd' );
				}, { init: false } );
			}
		});
		const r = new Ractive({
			el: fixture,
			template: '{{#each list}}<cmp foo="{{.}}" />{{/each}}',
			components: { cmp },
			data: {
				list: [ { bar: 'a' },  { bar: 'b' }, { bar: 'c' } ]
			}
		});

		t.htmlEqual( fixture.innerHTML, 'abc' );
		let item = r.splice( 'list', 2, 1 ).result[0];
		r.splice( 'list', 0, 0, item );
		t.htmlEqual( fixture.innerHTML, 'cab' );
		item = r.splice( 'list', 2, 1 ).result[0];
		r.splice( 'list', 0, 0, item );
		t.htmlEqual( fixture.innerHTML, 'bca' );
		t.equal( count, 0 );

		r.set( 'list.0.bar', 'd' );
		t.equal( count, 1 );
	});

	test( 'components that are spliced out should not fire observers - #2604', t => {
		const cmp = Ractive.extend({
			template: '<div />',
			onconfig () {
				this.observe( 'item.foo', () => {
					this.set( 'item.bar', 0 );
				}, { defer: true });
			}
		});
		const r = new Ractive({
			el: fixture,
			template: '{{#each list}}<cmp item="{{.}}" />{{/each}}',
			data: {
				list: [ { foo: 1 }, { foo: 2 }, { foo: 3 } ]
			},
			components: { cmp }
		});

		t.equal( r.findAll( 'div' ).length, 3 );
		const i = r.pop( 'list' ).result;
		r.unshift( 'list', i );
		t.equal( r.findAll( 'div' ).length, 3 );
	});

	test( 'components that are spliced out should not fire pattern observers - #2604', t => {
		let count = 0;
		const cmp = Ractive.extend({
			template: '<div />',
			onconfig () {
				this.observe( 'item.*', () => {
					count++;
				}, { defer: true });
			}
		});
		const r = new Ractive({
			el: fixture,
			template: '{{#each list}}<cmp item="{{.}}" />{{/each}}',
			data: {
				list: [ { foo: 1 }, { foo: 2 }, { foo: 3 } ]
			},
			components: { cmp }
		});

		t.equal( count, 3 );
		const i = r.pop( 'list' ).result;
		t.equal( count, 3 );
		r.unshift( 'list', i );
		t.equal( count, 4 );
	});

	test( 'shuffling around nested lists', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#each outer}}{{#each inner}}{{.foo}}{{../0.foo}}{{~/outer.0.inner.0.foo}}{{/each}}{{.inner.0.foo}}{{/each}}',
			data: {
				outer: [
					{ inner: [ { foo: 1 }, { foo: 2 } ] },
					{ inner: [ { foo: 3 }, { foo: 4 } ] }
				]
			}
		});

		t.htmlEqual( fixture.innerHTML, '11121113314313' );
		r.unshift( 'outer', { inner: [ { foo: 5 } ] } );
		t.htmlEqual( fixture.innerHTML, '555511521513354353' );
		r.unshift( 'outer.0.inner', { foo: 9 } );
		t.htmlEqual( fixture.innerHTML, '999559911921913394393' );
	});

	test( 'observers shuffle correctly', t => {
		let val;
		const r = new Ractive({
			el: fixture,
			onconfig () {
				this.observe( 'list.0.bar', v => val = v );
			},
			data: {
				list: [ { bar: 1 } ]
			}
		});

		t.equal( val, 1 );
		r.unshift( 'list', { bar: 3 } );
		t.equal( val, 3 );
		r.set( 'list.0.bar', 4 );
		t.equal( val, 4 );
	});

	test( 'pattern observers shuffle correctly', t => {
		let val;
		const r = new Ractive({
			el: fixture,
			onconfig () {
				this.observe( 'list.0.*', v => val = v );
			},
			data: {
				list: [ { bar: 1 } ]
			}
		});

		t.equal( val, 1 );
		r.unshift( 'list', { bar: 3 } );
		t.equal( val, 3 );
		r.set( 'list.0.bar', 4 );
		t.equal( val, 4 );
	});

	test( 'mapped observers shuffle correctly', t => {
		let rel;
		let stat;
		let relKey;
		let statKey;

		const cmp = Ractive.extend({
			onconfig () {
				this.observe( 'foo.bar', ( v, o, k ) => {
					rel = v;
					relKey = k;
				});
				this.observe( 'bar.bar', ( v, o, k ) => {
					stat = v;
					statKey = k;
				});
			}
		});
		const r = new Ractive({
			el: fixture,
			template: '{{#each list}}<cmp foo="{{.}}" bar="{{~/list.0}}" />{{/each}}',
			data: {
				list: [ { bar: 1 } ]
			},
			components: { cmp }
		});

		t.equal( rel, 1 );
		t.equal( relKey, 'foo.bar' );
		t.equal( stat, 1 );
		t.equal( statKey, 'bar.bar' );
		r.unshift( 'list', { bar: 3 } );
		t.equal( rel, 3 );
		t.equal( relKey, 'foo.bar' );
		t.equal( stat, 3 );
		t.equal( statKey, 'bar.bar' );
		r.set( 'list.0.bar', 4 );
		t.equal( rel, 4 );
		t.equal( stat, 4 );
	});

	test( 'mapped pattern observers shuffle correctly', t => {
		let rel;
		let stat;
		let relKey;
		let statKey;
		let relPart;
		let statPart;

		const cmp = Ractive.extend({
			onconfig () {
				this.observe( 'foo.*', ( v, o, k, p ) => {
					rel = v;
					relKey = k;
					relPart = p;
				});
				this.observe( 'bar.*', ( v, o, k, p ) => {
					stat = v;
					statKey = k;
					statPart = p;
				});
			}
		});
		const r = new Ractive({
			el: fixture,
			template: '{{#each list}}<cmp foo="{{.}}" bar="{{~/list.0}}" />{{/each}}',
			data: {
				list: [ { bar: 1 } ]
			},
			components: { cmp }
		});

		t.equal( rel, 1 );
		t.equal( stat, 1 );
		t.equal( relKey, 'foo.bar' );
		t.equal( relPart, 'bar' );
		t.equal( statKey, 'bar.bar' );
		t.equal( statPart, 'bar' );
		r.unshift( 'list', { bar: 3 } );
		t.equal( rel, 3 );
		t.equal( stat, 3 );
		t.equal( relKey, 'foo.bar' );
		t.equal( relPart, 'bar' );
		t.equal( statKey, 'bar.bar' );
		t.equal( statPart, 'bar' );
		r.set( 'list.0.bar', 4 );
		t.equal( rel, 4 );
		t.equal( stat, 4 );
	});

	test( 'decorators shuffle correctly', t => {
		let inits = 0;
		let upds = 0;
		let tears = 0;

		const r = new Ractive({
			el: fixture,
			template: '{{#each list}}<span as-foo="." />{{/each}}',
			data: { list: [ 1, 2, 3 ] },
			decorators: {
				foo ( node, num ) {
					inits++;
					node.innerHTML = num;

					return {
						update ( num ) {
							upds++;
							node.innerHTML = num;
						},
						teardown () { tears++; }
					};
				}
			}
		});

		t.equal( inits, 3 );
		t.htmlEqual( fixture.innerHTML, '<span>1</span><span>2</span><span>3</span>' );
		r.shift( 'list' );
		t.ok( tears === 1 && inits === 3 && upds === 0 );
		t.htmlEqual( fixture.innerHTML, '<span>2</span><span>3</span>' );
		r.set( 'list.0', 7 );
		t.ok( tears === 1 && inits === 3 && upds === 1 );
		t.htmlEqual( fixture.innerHTML, '<span>7</span><span>3</span>' );
	});

	test( 'transitions shuffle correctly', t => {
		const map = { 1: 0, 2: 0, undefined: 0 };
		const r = new Ractive({
			el: fixture,
			template: '{{#each list}}{{#if .show}}<span foo-out=".num" />{{/if}}{{/each}}',
			data: { list: [ { num: 1, show: true }, { num: 2, show: true } ] },
			transitions: {
				foo ( trans, num ) {
					map[num]++;
					trans.complete();
				}
			}
		});

		r.shift( 'list' );
		t.ok( map[undefined] === 1 && map[1] === 0 && map[2] === 0 );
		r.toggle( 'list.0.show' );
		t.ok( map[undefined] === 1 && map[1] === 0 && map[2] === 1 );
		r.toggle( 'list.0.show' );
		r.shift( 'list' );
		t.ok( map[undefined] === 2 && map[1] === 0 && map[2] === 1 );
	});

	test( `shuffling lists with nested lists with same-named keypaths (#2491)`, t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#each list}}{{#each list}}<span>{{@keypath}}</span>{{/each}}{{/each}}',
			data: {
				list: [ { list: [0] }, { list: [{ list: [0] }, 1, 2] } ]
			}
		});

		t.equal( fixture.innerHTML, '<span>list.0.list.0</span><span>list.1.list.0</span><span>list.1.list.1</span><span>list.1.list.2</span>' );
		const tmp = r.splice( 'list.1.list', 0, 1 ).result[0];
		t.equal( fixture.innerHTML, '<span>list.0.list.0</span><span>list.1.list.0</span><span>list.1.list.1</span>' );
		r.splice( 'list', 0, 0, tmp );
		t.equal( fixture.innerHTML, '<span>list.0.list.0</span><span>list.1.list.0</span><span>list.2.list.0</span><span>list.2.list.1</span>' );

		t.equal( r.getContext( r.findAll( 'span' )[2] ).resolve(), 'list.2.list.0' );
	});

	test( `shuffle set should also check for element updates (#3010)`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{#each items}}<div>{{.name}}</div>{{/each}}`,
			data: {
				items: [
					{ name: 'apple', id: 1 },
					{ name: 'filler1', id: 200 },
					{ name: 'filler2', id: 201 },
					{ name: 'orange', id: 2 },
					{ name: 'banana', id: 3 }
				]
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div>apple</div><div>filler1</div><div>filler2</div><div>orange</div><div>banana</div>' );

		r.set( 'items', [
			{ id: 3, name: 'gwen stefani' },
			{ id: 4, name: 'george lucas' },
			{ id: 1, name: 'granny smith' },
		], { shuffle: 'id' });

		t.htmlEqual( fixture.innerHTML, '<div>gwen stefani</div><div>george lucas</div><div>granny smith</div>' );
	});

	test( `reference expressions update correctly when their target model rebinds (#3045)`, t => {
		const r = new Ractive({
			target: fixture,
			template: `{{foo[bar].baz.bat}}`,
			data: {
				dest1: { path: { baz: { bat: 42 } } },
				dest2: { path: { baz: { bat: 99 } } },
				bar: 'path'
			}
		});

		r.link( 'dest1', 'foo' );

		t.htmlEqual( fixture.innerHTML, '42' );

		r.link( 'dest2', 'foo' );

		t.htmlEqual( fixture.innerHTML, '99' );
	});

	test( `reference expression children invalidate correctly on shuffle (#3045)`, t => {
		const one = [ { bat: 42, bop: 43, bip: 44 } ];
		const two = [ { bat: 99, bop: 98, bip: 97 }, { bat: 98, bop: 10, bip: 9 } ];
		const r = new Ractive({
			target: fixture,
			template: `<select>{{#each foo[bar]}}<option title="{{.bop}}" value="{{.bat}}" label="{{.bip}}">{{.bop}}</option>{{/each}}</select>`,
			data: {
				dest1: { path: one },
				bar: 'path'
			}
		});

		r.link( 'dest1', 'foo' );

		t.equal( r.findAll( 'option' ).map( o => o.value ).join( '' ), '42' );
		t.equal( r.findAll( 'option' ).map( o => o.label ).join( '' ), '44' );

		r.set( 'dest1.path', two );

		t.equal( r.findAll( 'option' ).map( o => o.value ).join( '' ), '9998' );
		t.equal( r.findAll( 'option' ).map( o => o.label ).join( '' ), '979' );

		r.set( 'dest1.path', one );

		t.equal( r.findAll( 'option' ).map( o => o.value ).join( '' ), '42' );
		t.equal( r.findAll( 'option' ).map( o => o.label ).join( '' ), '44' );
	});
}
