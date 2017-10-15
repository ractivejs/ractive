import { initModule } from '../helpers/test-config';
import { test } from 'qunit';
import { fire } from 'simulant';

export default function() {
	initModule( 'proxies.js' );

	test( `basic proxy`, t => {
		new Ractive({
			target: fixture,
			template: '<proxy />',
			proxies: {
				proxy: Ractive.proxy( () => ({ template: [ 'proxy' ] }) )
			}
		});

		t.htmlEqual( fixture.innerHTML, 'proxy' );
	});

	test( `proxies and sections`, t => {
		const r = new Ractive({
			target: fixture,
			template: `a<proxy />b{{#if foo}}c<proxy />d{{else}}<proxy />e<proxy />{{/if}}<proxy />{{#each list}}<proxy />{{/each}}{{#each list}}g<proxy />{{/each}}{{#each list}}<proxy />h{{/each}}`,
			data: {
				list: [ 0 ],
				foo: true
			},
			proxies: {
				proxy: Ractive.proxy( () => ({ template: [ 'z' ] }) )
			}
		});

		t.htmlEqual( fixture.innerHTML, 'azbczdzzgzzh' );

		r.toggle( 'foo' );

		t.htmlEqual( fixture.innerHTML, 'azbzezzzgzzh' );
	});

	test( `proxy claimed attributes`, t => {
		const r = new Ractive({
			target: fixture,
			template: '<proxy name="joe" value="{{foo}}" />',
			proxies: {
				proxy: Ractive.proxy(
					( handle, attrs ) => {
						t.equal( Object.keys( attrs ).length, 1 );
						t.equal( attrs.name, 'joe' );
						t.equal( handle.template.m.length, 1 );
						t.equal( handle.template.m[0].n, 'value' );

						return {
							template: [{ t: 7, e: 'input', m: handle.template.m }]
						};
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

	test( `updating claimed proxy attributes`, t => {
		const obj = { hello: 'world' };

		const r = new Ractive({
			target: fixture,
			template: `<proxy name="{{foo}}" value="{{bar}}" disabled />`,
			data: {
				foo: 10,
				bar: obj
			},
			proxies: {
				proxy: Ractive.proxy(
					( handle, attrs ) => {
						t.equal( Object.keys( attrs ).length, 2 );
						t.strictEqual( attrs.name, 10 );
						t.strictEqual( attrs.value, obj );
						return {
							template: [{ t: 7, e: 'button', m: handle.template.m }],
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

	test( `shuffling claimed proxy attributes`, t => {
		t.expect( 0 );

		const r = new Ractive({
			target: fixture,
			template: `{{#each list}}<proxy bind-val=. />{{/each}}`,
			data: {
				list: [ 0 ]
			},
			proxies: {
				proxy: Ractive.proxy(
					() => {
						return {
							template: [],
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

	test( `proxy content partial`, t => {
		new Ractive({
			target: fixture,
			template: '<proxy>proxy1</proxy><proxy>nope{{#partial content}}proxy2{{/partial}}</proxy>',
			proxies: {
				proxy: Ractive.proxy(
					() => ({ template: '{{>content}}' })
				)
			}
		});

		t.htmlEqual( fixture.innerHTML, 'proxy1proxy2' );
	});

	test( `proxy unclaimed attributes partial`, t => {
		new Ractive({
			target: fixture,
			template: `<proxy1 class="foo" name="bar" /><proxy2 class="joe" on-click="bar" />`,
			proxies: {
				proxy1: Ractive.proxy(
					handle => {
						t.equal( handle.template.m.length, 1 );
						return { template: '<div {{>extra-attributes}} />' };
					},
					{ attributes: [ 'name' ] }
				),
				proxy2: Ractive.proxy(
					handle => {
						t.equal( handle.template.m.length, 2 );
						return { template: '<span {{>extra-attributes}} />' };
					}
				)
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div class="foo"></div><span class="joe"></span>' );
	});

	test( `optional proxy invalidate callback`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: `{{#if bar}}...{{/if}}<proxy>{{#if foo}}...{{/if}}</proxy>`,
			data: {
				foo: true,
				bar: true
			},
			proxies: {
				proxy: Ractive.proxy(
					() => {
						return {
							template: '{{>content}}',
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

	test( `proxy refresh`, t => {
		let handle;
		const proxy = {};

		new Ractive({
			target: fixture,
			template: '<proxy />',
			proxies: {
				proxy: Ractive.proxy( h => {
					handle = h;
					return proxy;
				})
			}
		});

		const script = document.createElement( 'script' );
		script.setAttribute( 'type', 'text/html' );
		script.setAttribute( 'id', 'proxy-template' );
		script.textContent = 'hello';
		document.body.appendChild( script );

		t.htmlEqual( fixture.innerHTML, '' );

		proxy.template = '#proxy-template';
		handle.refresh();
		t.htmlEqual( fixture.innerHTML, 'hello' );

		proxy.template = 'testing';
		handle.refresh();
		t.htmlEqual( fixture.innerHTML, 'testing' );

		proxy.template = { template: 'partial style obj' };
		handle.refresh();
		t.htmlEqual( fixture.innerHTML, 'partial style obj' );

		proxy.template = { t: [ 'other partial' ] };
		handle.refresh();
		t.htmlEqual( fixture.innerHTML, 'other partial' );

		proxy.template = [ 'direct template' ];
		handle.refresh();
		t.htmlEqual( fixture.innerHTML, 'direct template' );

		document.body.removeChild( script );
	});

	test( `proxy progressive enhancement`, t => {
		fixture.innerHTML = `<div class="foo">hello</div>`;
		const div = fixture.childNodes[0];

		new Ractive({
			target: fixture,
			enhance: true,
			template: '<proxy />',
			proxies: {
				proxy: Ractive.proxy( () => ({ template: '<div class="foo">hello</div>' }) )
			}
		});

		t.ok( fixture.childNodes.length === 1 );
		t.ok( fixture.childNodes[0] === div );
	});

	test( `proxy kept set`, t => {
		const r = new Ractive({
			target: fixture,
			template: '{{#if foo}}<proxy />{{/if}}',
			data: {
				foo: true
			},
			proxies: {
				proxy: Ractive.proxy( () => ({ template: '<div class="foo">hello</div>' }) )
			}
		});

		const div = fixture.childNodes[0];

		r.toggle( 'foo', { keep: true } );
		r.toggle( 'foo' );

		t.ok( fixture.childNodes.length === 1 );
		t.ok( fixture.childNodes[0] === div );
	});

	test( `proxy in component`, t => {
		new Ractive({
			target: fixture,
			template: '<div /><cmp />',
			components: {
				cmp: Ractive.extend({
					template: '<div />',
					proxies: {
						div: Ractive.proxy( () => ({ template: '<span />' }) )
					}
				})
			}
		});

		t.htmlEqual( fixture.innerHTML, '<div></div><span></span>' );
	});

	test( `proxy teardown callback`, t => {
		let up = 0;
		let down = 0;

		const r = new Ractive({
			target: fixture,
			template: `{{#if foo}}<proxy />{{/if}}`,
			proxies: {
				proxy: Ractive.proxy(
					() => ++up && {
						template: 'yep',
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

	test( `proxy css`, t => {
		const r = new Ractive({
			target: fixture,
			template: `<proxy />`,
			proxies: {
				proxy: Ractive.proxy(
					() => ({ template: '<div />' }),
					{
						css: 'div { width: 123px; }'
					}
				)
			}
		});

		t.equal( r.find( 'div' ).clientWidth, 123 );
	});

	test( `proxy css no transform`, t => {
		const r = new Ractive({
			target: fixture,
			template: `<div class="proxy-css-no-transforms" /><proxy />`,
			proxies: {
				proxy: Ractive.proxy(
					() => ({ template: [ 'yep' ] }),
					{
						css: '.proxy-css-no-transforms { width: 123px; }',
						noCssTransform: true
					}
				)
			}
		});

		t.equal( r.find( 'div' ).clientWidth, 123 );
	});

	test( `proxy css fn`, t => {
		const proxy = Ractive.proxy(
			() => ({ template: '<div />' }),
			{
				css ( data ) {
					return `div { width: ${data('width')}; }`;
				}
			}
		);

		proxy.styleSet( 'width', '123px' );

		const r = new Ractive({
			target: fixture,
			template: `<proxy />`,
			proxies: {
				proxy
			}
		});

		t.equal( r.find( 'div' ).clientWidth, 123 );

		proxy.styleSet( 'width', '124px' );

		t.equal( r.find( 'div' ).clientWidth, 124 );
	});
}
