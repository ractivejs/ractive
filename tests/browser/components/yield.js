import { fire } from 'simulant';
import { hasUsableConsole, onWarn, initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'components/yield.js' );

	test( 'Basic yield', t => {
		const Widget = Ractive.extend({
			template: '<p>{{yield}}</p>'
		});

		new Ractive({
			el: fixture,
			template: '<Widget>yeah!</Widget>',
			components: { Widget }
		});

		t.htmlEqual( fixture.innerHTML, '<p>yeah!</p>' );
	});

	test( 'References are resolved in parent context', t => {
		const Widget = Ractive.extend({
			template: '<p>{{yield}}</p>',
			isolated: true
		});

		new Ractive({
			el: fixture,
			template: '<Widget>{{foo}}</Widget>',
			data: { foo: 'yeah!' },
			components: { Widget }
		});

		t.htmlEqual( fixture.innerHTML, '<p>yeah!</p>' );
	});

	test( 'References are resolved in parent context through multiple layers', t => {
		const WidgetInner = Ractive.extend({
			template: '<p>{{yield}}</p>',
			isolated: true
		});

		const Widget = Ractive.extend({
			template: '<WidgetInner>{{yield}}</WidgetInner>',
			isolated: true,
			components: { WidgetInner }
		});

		const Middle = Ractive.extend({
			template: '<strong>{{yield}}</strong>'
		});

		new Ractive({
			el: fixture,
			template: '<Widget><Middle>{{foo}}</Middle></Widget>',
			data: { foo: 'yeah!' },
			components: { Widget, Middle }
		});

		t.htmlEqual( fixture.innerHTML, '<p><strong>yeah!</strong></p>' );
	});

	test( 'Events fire in parent context', t => {
		t.expect( 1 );

		const WidgetInner = Ractive.extend({
			template: '<p>{{yield}}</p>',
			isolated: true
		});

		const Widget = Ractive.extend({
			template: '<WidgetInner>{{yield}}</WidgetInner>',
			isolated: true,
			components: { WidgetInner }
		});

		const Middle = Ractive.extend({
			template: '<strong>{{yield}}</strong>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget><Middle><button on-click="@this.test(foo)">click me</button></Middle></Widget>',
			data: { foo: 'yeah!' },
			components: { Widget, Middle }
		});

		ractive.test = function ( foo ) {
			t.equal( foo, 'yeah!' );
		};

		fire( ractive.find( 'button' ), 'click' );
	});

	test( 'A component {{yield}} can be rerendered in conditional section block', t => {
		const Widget = Ractive.extend({
			template: '<p>{{#foo}}{{yield}}{{/}}</p>',
			isolated: false
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget>yield</Widget>',
			components: { Widget },
			data: { foo: true }
		});

		ractive.set( 'foo', false );
		ractive.set( 'foo', true );

		t.htmlEqual( fixture.innerHTML, '<p>yield</p>' );
	});

	test( 'A component {{yield}} can be rerendered in list section block', t => {
		const Widget = Ractive.extend({
			template: `
				{{#each items:i}}
					{{this}}{{#if i===1}}:{{yield}}:{{/if}}
				{{/each}}`,
			isolated: false
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget>YIELDED</Widget>',
			components: { Widget },
			data: { items: [ 'a', 'b', 'c' ] }
		});

		t.htmlEqual( fixture.innerHTML, 'ab:YIELDED:c' );

		ractive.set( 'items', [ 'c', 'a' ], { shuffle: true } );

		t.htmlEqual( fixture.innerHTML, 'ca:YIELDED:' );
	});

	test( 'A component {{yield}} should be parented by the fragment holding the yield and not the fragment holding the component', t => {
		const Widget = Ractive.extend({
			template: '<div>{{yield}}</div>',
			data: {
				foo: true
			}
		});

		new Ractive({
			el: fixture,
			template: `
				<Widget foo='{{foo}}'>
					{{#if foo}}foo!{{/if}}
					{{#if foo}}foo!{{/if}}
				</Widget>`,
			components: { Widget }
		});

		t.htmlEqual( fixture.innerHTML, '<div>foo! foo!</div>' );
	});

	test( 'Named yield with a hyphenated name (#1681)', t => {
		const template = `
			<Widget>
				{{#partial foo-bar}}
					<p>this is foo-bar</p>
				{{/partial}}
			</Widget>`;

		const Widget = Ractive.extend({
			template: '{{yield foo-bar}}'
		});

		new Ractive({
			el: fixture,
			template,
			components: { Widget }
		});

		t.htmlEqual( fixture.innerHTML, '<p>this is foo-bar</p>' );
	});

	test( 'yield can yield an expression', t => {
		const cmp = Ractive.extend({
			template: '{{yield { template: "<p>yep</p>" } }}'
		});
		new Ractive({
			el: fixture,
			template: '<cmp />',
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, '<p>yep</p>' );
	});

	test( 'Named yield with Ractive.extend() works as with new Ractive() (#1680)', t => {
		const Widget = Ractive.extend({
			template: '{{yield foo}}'
		});

		const template = `
			<Widget>
				{{#partial foo}}
					<p>this is foo</p>
				{{/partial}}
			</Widget>`;

		new Ractive({
			el: fixture,
			template,
			components: { Widget }
		});

		t.htmlEqual( fixture.innerHTML, '<p>this is foo</p>' );

		const Container = Ractive.extend({
			template,
			components: { Widget }
		});

		new Container({
			el: fixture
		});

		t.htmlEqual( fixture.innerHTML, '<p>this is foo</p>' );
	});

	test( 'yielded fragments that are updated from an observer should actually update (#2225)', t => {
		const cmp = Ractive.extend({
			template: '{{yield}}',
			onrender() {
				this.observe( 'bar', v => this.set( 'baz', `${v} yep` ) );
			}
		});

		const r = new Ractive({
			el: fixture,
			template: '-<cmp bar="{{foo}}" baz="{{bat}}">{{bat}}</cmp>',
			data: {
				foo: ''
			},
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, '- yep' );
		r.set( 'foo', 2 );
		t.htmlEqual( fixture.innerHTML, '-2 yep' );
	});

	test( 'Components inherited from more than one generation off work with named yields', t => {
		const widget = Ractive.extend({
			template: '{{yield foo}}'
		});

		const Base = Ractive.extend({
			components: { widget }
		});

		const Step1 = Base.extend();
		const Step2 = Step1.extend();
		const Step3 = Step2.extend({
			template: `
				<widget>
					{{#partial foo}}
						<p>this is foo</p>
					{{/partial}}
				</widget>`
		});

		new Step3({
			el: fixture
		});

		t.htmlEqual( fixture.innerHTML, '<p>this is foo</p>' );
	});

	test( 'yielders should properly update with their container instance (#2235)', t => {
		const Foo = Ractive.extend({
			template: '{{yield}}'
		});

		const r = new Ractive({
			el: fixture,
			template: '<Foo>{{foo}}</Foo>',
			data: {
				foo: 'foo'
			},
			components: { Foo }
		});

		t.htmlEqual( fixture.innerHTML, 'foo' );
		r.set( 'foo', 'bar' );
		t.htmlEqual( fixture.innerHTML, 'bar' );
	});

	test( 'yielders should search the container for their anchor (#2235)', t => {
		const Foo = Ractive.extend({
			template: '<div>{{yield}}</div>'
		});

		const r = new Ractive({
			el: fixture,
			template: '<Foo>{{#if foo}}bar{{/if}}</Foo>',
			data: {
				foo: false
			},
			components: { Foo }
		});

		t.htmlEqual( fixture.innerHTML, '<div></div>' );
		r.set( 'foo', true );
		t.htmlEqual( fixture.innerHTML, '<div>bar</div>' );
	});

	if ( hasUsableConsole ) {
		test( 'Yield with missing partial (#1681)', t => {
			onWarn( msg => {
				t.ok( /Could not find template for partial 'missing'/.test( msg ) );
			});

			const Widget = Ractive.extend({
				template: '{{yield missing}}'
			});

			new Ractive({
				template: '<Widget/>',
				components: { Widget }
			});
		});
	}

	test( 'a plain content yielder may provide context via aliases', t => {
		const cmp = Ractive.extend({
			template: `<ul>{{#each items}}<li>{{yield with . as item}}</li>{{/each}}</ul>`
		});

		new Ractive({
			el: fixture,
			template: `<cmp items="{{.list}}">hello {{item}}</cmp>`,
			data: {
				list: [ 1, 2, 3 ]
			},
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, '<ul><li>hello 1</li><li>hello 2</li><li>hello 3</li></ul>' );
	});

	test( 'a specific content yielder may provide context via aliases', t => {
		const cmp = Ractive.extend({
			template: `<ul>{{#each items}}<li>{{yield foo with . as item}}</li>{{/each}}</ul>`
		});

		new Ractive({
			el: fixture,
			template: `<cmp items="{{.list}}">{{#partial foo}}hello {{item}}{{/partial}}</cmp>`,
			data: {
				list: [ 1, 2, 3 ]
			},
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, '<ul><li>hello 1</li><li>hello 2</li><li>hello 3</li></ul>' );
	});

	test( 'partial expression is evaluated outside of the partial context', t => {
		new Ractive({
			el: fixture,
			template: `{{>foo { foo: 'nope' } }}`,
			data: {
				foo: 'yep'
			},
			partials: {
				yep: 'yep',
				nope: 'nope'
			}
		});

		t.htmlEqual( fixture.innerHTML, 'yep' );
	});

	test( 'yield resolves its expression in the correct context', t => {
		const cmp = Ractive.extend({
			template: '{{yield foo.bar}}',
			data: {
				foo: { bar: 'content' }
			}
		});
		new Ractive({
			target: fixture,
			template: '<cmp>yep</cmp>',
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, 'yep' );
	});
}
