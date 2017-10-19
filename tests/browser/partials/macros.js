import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';
import { fire } from 'simulant';

export default function() {
	initModule( 'partials/macros.js' );

	test( `basic macro`, t => {
		new Ractive({
			target: fixture,
			template: '<macro />',
			partials: {
				macro: Ractive.macro( handle => handle.setTemplate( 'a macro' ) )
			}
		});

		t.htmlEqual( fixture.innerHTML, 'a macro' );
	});

	test( `macros and sections`, t => {
		const r = new Ractive({
			target: fixture,
			template: `a<macro />b{{#if foo}}c<macro />d{{else}}<macro />e<macro />{{/if}}<macro />{{#each list}}<macro />{{/each}}{{#each list}}g<macro />{{/each}}{{#each list}}<macro />h{{/each}}`,
			data: {
				list: [ 0 ],
				foo: true
			},
			partials: {
				macro: Ractive.macro( handle => handle.setTemplate( [ 'z' ] ) )
			}
		});

		t.htmlEqual( fixture.innerHTML, 'azbczdzzgzzh' );

		r.toggle( 'foo' );

		t.htmlEqual( fixture.innerHTML, 'azbzezzzgzzh' );
	});

	test( `macro claimed attributes`, t => {
		const r = new Ractive({
			target: fixture,
			template: '<macro name="joe" value="{{foo}}" />',
			partials: {
				macro: Ractive.macro(
					( handle, attrs ) => {
						t.equal( Object.keys( attrs ).length, 1 );
						t.equal( attrs.name, 'joe' );
						t.equal( handle.template.m.length, 1 );
						t.equal( handle.template.m[0].n, 'value' );

						handle.setTemplate( [{ t: 7, e: 'input', m: handle.template.m }] );
					},
					{
						attributes: [ 'name' ]
					}
				)
			}
		});

		t.htmlEqual( fixture.innerHTML, '<input />' );

		const input = r.find( 'input' );
		input.value = 'larry';
		fire( input, 'change' );

		t.equal( r.get( 'foo' ), 'larry' );
	});

	test( `updating claimed macro attributes`, t => {
		const obj = { hello: 'world' };

		const r = new Ractive({
			target: fixture,
			template: `<macro name="{{foo}}" value="{{bar}}" disabled />`,
			data: {
				foo: 10,
				bar: obj
			},
			partials: {
				macro: Ractive.macro(
					( handle, attrs ) => {
						t.equal( Object.keys( attrs ).length, 2 );
						t.strictEqual( attrs.name, 10 );
						t.strictEqual( attrs.value, obj );

						handle.setTemplate( [{ t: 7, e: 'button', m: handle.template.m }] );
						return {
							update ( attrs ) {
								t.equal( JSON.stringify( attrs.name ), JSON.stringify( [ 'test' ] ) );
								t.strictEqual( attrs.value, '42' );
							}
						};
					},
					{
						attributes: [ 'name', 'value' ]
					}
				)
			}
		});

		t.htmlEqual( fixture.innerHTML, '<button disabled></button>' );

		r.set({
			foo: [ 'test' ],
			bar: '42'
		});
	});

	test( `shuffling claimed macro attributes`, t => {
		t.expect( 0 );

		const r = new Ractive({
			target: fixture,
			template: `{{#each list}}<macro bind-val=. />{{/each}}`,
			data: {
				list: [ 0 ]
			},
			partials: {
				macro: Ractive.macro(
					() => {
						return {
							update () {
								t.ok( false, 'should not update on shuffle' );
							}
						};
					},
					{
						attributes: [ 'val' ]
					}
				)
			}
		});

		r.unshift( 'list', 1 );
	});

	test( `macro content partial`, t => {
		new Ractive({
			target: fixture,
			template: '<macro>macro1</macro><macro>nope{{#partial content}}macro2{{/partial}}</macro>',
			partials: {
				macro: Ractive.macro( handle => handle.setTemplate( '{{>content}}' ) )
			}
		});

		t.htmlEqual( fixture.innerHTML, 'macro1macro2' );
	});

	test( `macro unclaimed attributes partial`, t => {
		new Ractive({
			target: fixture,
			template: `<macro1 class="foo" name="bar" /><macro2 class="joe" on-click="bar" />`,
			partials: {
				macro1: Ractive.macro(
					handle => {
						t.equal( handle.template.m.length, 1 );
						handle.setTemplate( '<div {{>extra-attributes}} />' );
					},
					{ attributes: [ 'name' ] }
				),
				macro2: Ractive.macro(
					handle => {
						t.equal( handle.template.m.length, 2 );
						handle.setTemplate( '<span {{>extra-attributes}} />' );
					}
				)
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div class="foo"></div><span class="joe"></span>' );
	});

	test( `optional macro invalidate callback`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: `{{#if bar}}...{{/if}}<macro>{{#if foo}}...{{/if}}</macro>`,
			data: {
				foo: true,
				bar: true
			},
			partials: {
				macro: Ractive.macro(
					handle => {
						handle.setTemplate( '{{>content}}' );

						return {
							invalidate () {
								t.ok( true );
							}
						};
					}
				)
			}
		});

		r.toggle( 'foo' );
		r.toggle( 'bar' );
	});

	test( `macro out of band setTemplate`, t => {
		let handle;

		new Ractive({
			target: fixture,
			template: '<macro />',
			partials: {
				macro: Ractive.macro( h => {
					handle = h;
				})
			}
		});

		const script = document.createElement( 'script' );
		script.setAttribute( 'type', 'text/html' );
		script.setAttribute( 'id', 'macro-template' );
		script.textContent = 'hello';
		document.body.appendChild( script );

		t.htmlEqual( fixture.innerHTML, '' );

		handle.setTemplate( '#macro-template' );
		t.htmlEqual( fixture.innerHTML, 'hello' );

		handle.setTemplate( 'testing' );
		t.htmlEqual( fixture.innerHTML, 'testing' );

		handle.setTemplate( { template: 'partial style obj' } );
		t.htmlEqual( fixture.innerHTML, 'partial style obj' );

		handle.setTemplate( { t: [ 'other partial' ] } );
		t.htmlEqual( fixture.innerHTML, 'other partial' );

		handle.setTemplate( [ 'direct template' ] );
		t.htmlEqual( fixture.innerHTML, 'direct template' );

		document.body.removeChild( script );
	});

	test( `macro progressive enhancement`, t => {
		fixture.innerHTML = `<div class="foo">hello</div>`;
		const div = fixture.childNodes[0];

		new Ractive({
			target: fixture,
			enhance: true,
			template: '<macro />',
			partials: {
				macro: Ractive.macro( handle => handle.setTemplate( '<div class="foo">hello</div>' ) )
			}
		});

		t.ok( fixture.childNodes.length === 1 );
		t.ok( fixture.childNodes[0] === div );
	});

	test( `macro kept set`, t => {
		const r = new Ractive({
			target: fixture,
			template: '{{#if foo}}<macro />{{/if}}',
			data: {
				foo: true
			},
			partials: {
				macro: Ractive.macro( handle => handle.setTemplate( '<div class="foo">hello</div>' ) )
			}
		});

		const div = fixture.childNodes[0];

		r.toggle( 'foo', { keep: true } );
		r.toggle( 'foo' );

		t.ok( fixture.childNodes.length === 1 );
		t.ok( fixture.childNodes[0] === div );
	});

	test( `macro in component`, t => {
		new Ractive({
			target: fixture,
			template: '<div /><cmp />',
			components: {
				cmp: Ractive.extend({
					template: '<div />',
					partials: {
						div: Ractive.macro( handle => handle.setTemplate( '<span />' ) )
					}
				})
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div></div><span></span>' );
	});

	test( `macro teardown callback`, t => {
		let up = 0;
		let down = 0;

		const r = new Ractive({
			target: fixture,
			template: `{{#if foo}}<macro />{{/if}}`,
			partials: {
				macro: Ractive.macro(
					() => ++up && {
						teardown () { down++; }
					}
				)
			}
		});

		r.toggle( 'foo' );

		t.equal( up, 1 );
		t.equal( down, 0 );

		r.toggle( 'foo' );

		t.equal( up, 1 );
		t.equal( down, 1 );

		r.toggle( 'foo' );

		t.equal( up, 2 );
		t.equal( down, 1 );

		r.toggle( 'foo' );

		t.equal( up, 2 );
		t.equal( down, 2 );
	});

	test( `macro css`, t => {
		const r = new Ractive({
			target: fixture,
			template: `<macro />`,
			partials: {
				macro: Ractive.macro(
					handle => handle.setTemplate( '<div />' ),
					{
						css: 'div { width: 123px; }'
					}
				)
			}
		});

		t.equal( r.find( 'div' ).clientWidth, 123 );
	});

	test( `macro css no transform`, t => {
		const r = new Ractive({
			target: fixture,
			template: `<div class="macro-css-no-transforms" /><macro />`,
			partials: {
				macro: Ractive.macro(
					handle => handle.setTemplate( [ 'yep' ] ),
					{
						css: '.macro-css-no-transforms { width: 123px; }',
						noCssTransform: true
					}
				)
			}
		});

		t.equal( r.find( 'div' ).clientWidth, 123 );
	});

	test( `macro css fn`, t => {
		const macro = Ractive.macro(
			handle => handle.setTemplate( '<div />' ),
			{
				css ( data ) {
					return `div { width: ${data('width')}; }`;
				}
			}
		);

		macro.styleSet( 'width', '123px' );

		const r = new Ractive({
			target: fixture,
			template: `<macro />`,
			partials: {
				macro
			}
		});

		t.equal( r.find( 'div' ).clientWidth, 123 );

		macro.styleSet( 'width', '124px' );

		t.equal( r.find( 'div' ).clientWidth, 124 );
	});
}
