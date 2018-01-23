import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

/* globals window, document */

export default function() {
	initModule( 'render/misc' );

	if ( Ractive.svg ) {
		test( 'Style elements have content inserted that becomes .textContent gh #569', t => {
			new Ractive({
				el: fixture,
				template: '<svg><style id="style">text { font-size: 40px }</style></svg>'
			});

			const style = document.getElementById('style');

			t.ok( style );
			t.equal( style.textContent, 'text { font-size: 40px }' );
		});
	}

	test( 'Nested reference expression updates when array index member changes', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#item}}{{foo[bar]}}{{/}}',
			data: { item: { foo: ['fizz', 'bizz'], bar: 0 } }
		});

		t.equal( fixture.innerHTML, 'fizz' );
		ractive.set( 'item.bar', 1 );
		t.equal( fixture.innerHTML, 'bizz' );

	});

	test( 'Conditional section with reference expression updates when keypath changes', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#foo[bar]}}buzz{{/}}',
			data: {
				foo:{ fop: false, bizz: true } ,
				bar: 'fop'
			}
		});

		t.equal( fixture.innerHTML, '' );
		ractive.set( 'bar', 'bizz' );
		t.equal( fixture.innerHTML, 'buzz' );

	});

	test( 'Input with reference expression updates target when keypath changes', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<input value="{{foo[bar]}}"/>',
			data: {
				foo:{ fop: 'fop', bizz: 'bizz' } ,
				bar: 'fop'
			}
		});

		ractive.set( 'bar', 'bizz' );
		ractive.find( 'input' ).value = 'buzz';
		ractive.updateModel();
		t.equal( ractive.get( 'foo.bizz' ), 'buzz' );

	});

	test( 'List of inputs with referenceExpression name update correctly', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `<input type='radio' name='{{responses[topic]}}'/>`,
			data: {
				topic: 'Product',
				responses: {}
			}
		});

		ractive.set( 'topic', 'Color' );
		const input = ractive.find('input');
		t.ok( input );
		t.equal( input.name, '{{responses.Color}}' );
	});

	test( 'List of inputs with nested referenceExpression name updates correctly', t => {
		t.expect(3);

		const ractive = new Ractive({
			el: fixture,
			template: `
			{{#step}}
			{{#options}}
			<input type='radio' name='{{responses[step.name]}}' value='{{.}}'/>
			{{/}}
			{{/}}`,
			data: {
				step: {
					name: 'Products',
					options: ['1', '2']
				},
				responses: {}
			}
		});

		ractive.set( 'step', {
			name: 'Colors',
			options: ['red', 'blue', 'yellow']
		});

		ractive.findAll('input').forEach((input) => {
			t.equal( input.name, '{{responses.Colors}}' );
		});
	});

	test( 'Rendering a non-append instance into an already-occupied element removes the other instance (#1430)', t => {
		let ractive = new Ractive({
			template: 'instance1'
		});
		ractive.render( fixture );

		t.htmlEqual( fixture.innerHTML, 'instance1' );

		ractive = new Ractive({
			template: 'instance2'
		});
		ractive.render( fixture );

		t.htmlEqual( fixture.innerHTML, 'instance2' );
	});

	test( 'Render may be called with a selector (#1430)', t => {
		const ractive = new Ractive({
			template: 'foo'
		});

		fixture.innerHTML = '<div id="foo">bar</div>';

		ractive.render( '#foo' );

		t.htmlEqual( fixture.innerHTML, '<div id="foo">foo</div>' );
	});

	test( 'Value changes in object iteration should cause updates (#1476)', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '{{#obj[sel]:sk}}{{sk}} {{@key}} {{.}}{{/}}',
			data: {
				obj: {
					key1: { a: 'a1', b: 'b1' },
					key2: { a: 'a2', b: 'b2', c: 'c2' },
					key3: { c: 'c3' }
				},
				sel: 'key1'
			}
		});

		t.htmlEqual( fixture.innerHTML, 'a a a1b b b1' );

		ractive.set( 'sel', 'key2' );
		t.htmlEqual( fixture.innerHTML, 'a a a2b b b2c c c2' );

		ractive.set( 'sel', 'key3' );
		t.htmlEqual( fixture.innerHTML, 'c c c3' );

		ractive.set( 'sel', 'key1' );
		t.htmlEqual( fixture.innerHTML, 'a a a1b b b1' );
	});

	test( 'Sections survive unrender-render (#1553)', t => {
		window.renderedFragments = 0;

		const ractive = new Ractive({
			template: '{{#each items}}<p>{{this}}</p>{{/each}}',
			data: { items: [ 1, 2, 3 ] }
		});

		ractive.render( fixture );
		ractive.unrender();
		ractive.render( fixture );

		t.htmlEqual( fixture.innerHTML, '<p>1</p><p>2</p><p>3</p>' );
	});

	test( 'Multi switch each block object -> array -> object -> array (#2054)', t => {
		const arrayData = ['a', 'b', 'c'];
		const objectData = { a: 'a', b: 'b', c: 'c' };
		const expected = 'abc';

		const ractive = new Ractive({
			el: fixture,
			template: '{{#each bar}}{{.}}{{/each}}',
			data: {
				bar: arrayData
			}
		});

		t.htmlEqual( fixture.innerHTML, expected );

		ractive.set( 'bar', objectData );
		t.htmlEqual( fixture.innerHTML, expected );

		ractive.set( 'bar', arrayData );
		t.htmlEqual( fixture.innerHTML, expected );
	});

	test( 'iteration special refs outside of an iteration should not error', t => {
		new Ractive({
			el: fixture,
			template: '{{@index}}{{@key}}'
		});

		t.ok( true, 'hey, it didn\'t throw' );
	});

	test( 'static delimiters should be configurable (#2240)', t => {
		new Ractive({
			el: fixture,
			template: '{{one}} {{{two}}} [[three]] [[[four]]]',
			delimiters: [ '{#', '#}' ],
			tripleDelimiters: [ '{{#', '#}}' ],
			staticDelimiters: [ '[#', '#]' ],
			staticTripleDelimiters: [ '[[#', '#]]' ]
		});

		t.htmlEqual( fixture.innerHTML, '{{one}} {{{two}}} [[three]] [[[four]]]');
	});

	test( 'a repeated section should skip empty iterations when looking for a next node for insertion (#2234)', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#each items}}{{#if .bool}}{{.val}}{{/if}}{{/each}}',
			data: {
				items: [ { bool: true, val: 1 }, { bool: true, val: 2 }, { bool: true, val: 3 } ]
			}
		});

		t.htmlEqual( fixture.innerHTML, '123' );
		r.set( 'items.0.bool', false );
		r.set( 'items.1.bool', false );
		t.htmlEqual( fixture.innerHTML, '3' );
		r.set( 'items.0.bool', true );
		t.htmlEqual( fixture.innerHTML, '13' );
	});

	test( 'fragment should skip non-rendered items when searching for its next node (#2317)', t => {
		const r = new Ractive({
			el: fixture,
			template: '{{#if step === 3}}3{{/if}}{{#if step === 1}}1{{/if}}{{#if step === 2}}2{{/if}}text',
			data: { step: 1 }
		});

		r.set( 'step', 2 );
		t.htmlEqual( fixture.innerHTML, '2text' );
		r.set( 'step', 3 );
		t.htmlEqual( fixture.innerHTML, '3text' );
	});

	if ( typeof Object.create === 'function' ) {
		test( 'data of type Object.create(null) (#1825)', t => {
			const ractive = new Ractive({
				el: fixture,
				template: '<hr class="{{ noproto }}">{{ noproto }}',
				data: { noproto: Object.create(null) }
			});

			const expected = '<hr class>';

			t.htmlEqual( fixture.innerHTML, expected );
			t.equal( ractive.toHTML(), expected );
		});
	}

	test( 'unresolveds that go out of scope should be unregistered', t => {
		t.expect( 0 );

		const r = new Ractive({
			el: fixture,
			template: `{{#each bar}}<span class="{{#if foo * 2 == 4}}yep{{/if}}">test</span>{{/each}}`,
			data: { bar: [ 1 ] }
		});

		r.set( 'bar', [] );
		r.set( 'foo', 2 );
	});

	test( 'instances that are made dirty while updating should not get stuck (#2554)', t => {
		const r = new Ractive({
			el: fixture,
			template: `<span>{{bar}}</span>{{#if foo}}<input type="checkbox" checked="{{baf}}" />{{bar}}{{/if}}`,
			computed: {
				foo () {
					this.set( 'bar', 'yep' );
					return this.get( 'cond' );
				},
				baf () {
					this.set( 'bar', 'hmm' );
					return this.get( 'cond' );
				}
			},
			data: {
				cond: false,
				bar: '???'
			}
		});

		const span = r.find( 'span' );

		t.htmlEqual( span.innerHTML, 'yep' );
		r.set( 'cond', true );
		r.set( 'bar', 'y' );
		t.htmlEqual( span.innerHTML, 'y' );
	});

	test( 'space entity refs should not be consumed during trimming (#2327)', t => {
		new Ractive({
			el: fixture,
			template: '\n  {{#if check}}\n    &nbsp;\n    {{first}}\n    &nbsp;\n    {{second}}\n    &nbsp;\n  {{/if}}\n',
			data: { check: true, first: 1, second: 2 }
		});

		t.equal( fixture.innerHTML, '&nbsp; 1 &nbsp; 2 &nbsp;' );
	});

	test( `rendering a textOnlyMode template renders text only`, t => {
		const r = new Ractive({
			template: Ractive.parse( `no <elements or="attributes" /> or &amp; & entities <{{any}} foo="bar"> {{just}} text, [[refs]], and {{#if foo}}sections{{/if}}`, { textOnlyMode: true } ),
			data: {
				any: 'any',
				just: 'just',
				refs: 'refs',
				foo: true
			}
		});

		t.equal( r.toText(), 'no <elements or="attributes" /> or &amp; & entities <any foo="bar"> just text, refs, and sections' );
	});
}
