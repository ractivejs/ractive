import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'methods/reset.js' );

	test( 'Basic reset', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{one}}{{two}}{{three}}',
			data: { one: 1, two: 2, three: 3 }
		});

		ractive.reset({ two: 4 });
		t.htmlEqual( fixture.innerHTML, '4' );
	});

	test( 'Invalid arguments', t => {
		const ractive = new Ractive({
			el: fixture
		});

		t.throws(() => {
			ractive.reset( 'data' );
		});

		// Assuming that data fn's are not allowed on reset
		// caller could just execute themselves:
		// ractive.reset(fn(), cb)
		// Otherwise introduces ambiguity...
		t.throws( () => {
			ractive.reset( () => {}, () => {});
		});
	});

	test( 'ractive.reset() returns a promise', t => {
		t.expect( 6 );

		const done = t.async();

		const ractive = new Ractive({
			el: fixture,
			template: '{{one}}{{two}}{{three}}',
			data: { one: 1, two: 2, three: 3 }
		});

		let counter = 3;
		const check = () => { --counter || done(); };

		function callback () {
			t.ok( true );
			check();
		}

		ractive.reset({ two: 4 }).then( callback );
		t.htmlEqual( fixture.innerHTML, '4' );
		ractive.reset({ one: 9 }).then( callback );
		t.htmlEqual( fixture.innerHTML, '9' );
		ractive.reset().then( callback );
		t.htmlEqual( fixture.innerHTML, '' );
	});

	test( 'Dynamic template functions are recalled on reset', t => {
		const done = t.async();

		const ractive = new Ractive({
			el: fixture,
			template () {
				return this.get( 'condition' ) ? '{{foo}}' : '{{bar}}';
			},
			data: { foo: 'fizz', bar: 'bizz', condition: true }
		});

		t.htmlEqual( fixture.innerHTML, 'fizz' );
		ractive.set('condition', false);
		ractive.reset( ractive.viewmodel.get() ).then( () => {
			t.htmlEqual( fixture.innerHTML, 'bizz' );
			done();
		});
	});

	test( 'Promise with dynamic template functions are recalled on reset', t => {
		t.expect( 5 );

		const done = t.async();

		const ractive = new Ractive({
			el: fixture,
			template () {
				return this.get( 'condition' ) ? '{{foo}}' : '{{bar}}';
			},
			data: { foo: 'fizz', bar: 'bizz', condition: true }
		});

		let counter = 2;
		const check = () => { --counter || done(); };

		function callback () {
			t.ok(true);
			check();
		}

		t.htmlEqual( fixture.innerHTML, 'fizz' );
		ractive.set( 'condition', false );
		ractive.reset( ractive.viewmodel.get() ).then( callback );
		t.htmlEqual( fixture.innerHTML, 'bizz' );
		ractive.set( 'condition', true );
		ractive.reset( ractive.viewmodel.get() ).then( callback );
		t.htmlEqual( fixture.innerHTML, 'fizz' );
	});

	test( 'resetTemplate rerenders with new template', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{foo}}',
			data: { foo: 'fizz', bar: 'bizz' }
		});

		t.htmlEqual( fixture.innerHTML, 'fizz' );
		ractive.resetTemplate( '{{bar}}' );
		t.htmlEqual( fixture.innerHTML, 'bizz' );
	});

	// Removed this functionality for now as not apparent
	// what purpose of calling resetTemplate() without rerender
	/*
test( 'resetTemplate with no template change doesnt rerender', t => {
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

	test( 'Reset retains parent default data (#572)', t => {
		const Widget = Ractive.extend({
			data: {
				uppercase ( str ) {
					return str.toUpperCase();
				}
			}
		});

		const ractive = new Widget({
			el: fixture,
			template: '{{ uppercase(foo) }}',
			data: { foo: 'bar' }
		});

		ractive.reset({ foo: 'bizz' });
		t.htmlEqual( fixture.innerHTML, 'BIZZ' );
	});

	test( 'Reset inserts { target, anchor } el option correctly', t => {
		const target = document.createElement('div');
		const anchor = document.createElement('div');

		anchor.innerHTML = 'bar';
		target.id = 'target';
		target.appendChild( anchor );
		fixture.appendChild( target );

		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>bar</div></div>' );

		const ractive = new Ractive({
			el: target,
			append: anchor,
			template: '<div>{{what}}</div>',
			data: { what: 'fizz' }
		});

		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>fizz</div><div>bar</div></div>' );
		ractive.reset({ what: 'foo' });
		t.htmlEqual( fixture.innerHTML, '<div id="target"><div>foo</div><div>bar</div></div>' );
	});

	test( 'resetTemplate removes an inline component from the DOM (#928)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<Widget type="{{type}}"/>',
			data: {
				type: 1
			},
			components: {
				Widget: Ractive.extend({
					template: 'ONE',
					oninit () {
						this.observe( 'type', type => {
							this.resetTemplate( type === 1 ? 'ONE' : 'TWO' );
						}, { init: false });
					}
				})
			}
		});

		t.htmlEqual( fixture.innerHTML, 'ONE' );
		ractive.set( 'type', 2 );
		t.htmlEqual( fixture.innerHTML, 'TWO' );
	});

	test( 'reset removes correctly from the DOM (#941)', t => {
		const ractive = new Ractive({
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

	test( 'reset does not re-render if template does not change', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<p>me</p>',
			data: {
				active: false
			}
		});

		const p = ractive.find( 'p' );
		t.ok( p );
		ractive.reset( { active: true } );
		t.equal( ractive.find('p'), p );
	});

	test( 'reset does not re-render if template function does not change', t => {
		const ractive = new Ractive({
			el: fixture,
			template ( data ) {
				return data.active ? '<p>active</p>' : '<p>not active</p>';
			},
			data: {
				active: false
			}
		});

		const p = ractive.find( 'p' );
		t.ok( p );
		ractive.reset({ active: false });
		t.equal( ractive.find('p'), p );
	});

	test( 'reset does re-render if template changes', t => {
		const ractive = new Ractive({
			el: fixture,
			template () {
				return this.get( 'active' ) ? '<p>active</p>' : '<p>not active</p>';
			},
			data: {
				active: false
			}
		});

		const p = ractive.find( 'p' );
		t.ok( p );
		ractive.reset( { active: true } );
		t.notEqual( ractive.find('p'), p );
	});

	test( 'reset removes an inline component from the DOM', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<widget type="{{type}}"/>',
			data: {
				type: 1
			},
			components: {
				widget: Ractive.extend({
					template ( data ) {
						return data.type === 1 ? 'ONE' : 'TWO';
					},
					oninit () {
						this.observe( 'type', type => {
							this.reset({ type });
						}, { init: false });
					}
				})
			}
		});

		ractive.set( 'type', 2 );
		t.htmlEqual( fixture.innerHTML, 'TWO' );
	});

	test( 'resetting an instance of a component with a data function (#1745)', t => {
		const Widget = Ractive.extend({
			data () {
				return { foo: 'bar' };
			}
		});

		const widget = new Widget();

		widget.set( 'foo', 'baz' );
		widget.reset();

		t.equal( widget.get( 'foo' ), 'bar' );
	});

	test( 'resetting the template of a component (#2658)', t => {
		const cmp = Ractive.extend({
			template: 'hello'
		});

		const r = new Ractive({
			el: fixture,
			template: '<cmp />',
			components: { cmp },
			partials: {
				cmp: '<cmp />'
			}
		});

		t.htmlEqual( fixture.innerHTML, 'hello' );
		r.findComponent( 'cmp' ).resetTemplate( 'yep' );
		t.htmlEqual( fixture.innerHTML, 'yep' );
		r.resetTemplate( '{{>cmp}}' );
		t.htmlEqual( fixture.innerHTML, 'hello' );
		r.findComponent( 'cmp' ).resetTemplate( 'yep' );
		t.htmlEqual( fixture.innerHTML, 'yep' );
	});
}
