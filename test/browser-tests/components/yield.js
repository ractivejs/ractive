import { test } from 'qunit';
import { fire } from 'simulant';
import { hasUsableConsole, onWarn } from '../test-config';
import { initModule } from '../test-config';

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

	test( 'A component can only have one {{yield}}', t => {
		const Widget = Ractive.extend({
			template: '<p>{{yield}}{{yield}}</p>'
		});

		t.throws( () => {
			new Ractive({
				el: fixture,
				template: '<Widget>yeah!</Widget>',
				components: { Widget }
			});
		}, /one {{yield}} declaration/ );
	});

	test( 'A component {{yield}} can be rerendered in conditional section block', t => {
		const Widget = Ractive.extend({
			template: '<p>{{#foo}}{{yield}}{{/}}</p>'
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
				{{/each}}`
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Widget>YIELDED</Widget>',
			components: { Widget },
			data: { items: [ 'a', 'b', 'c' ] }
		});

		t.htmlEqual( fixture.innerHTML, 'ab:YIELDED:c' );

		ractive.merge('items', [ 'c', 'a' ] );

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

	test( 'Named yield must have valid name, not expression (#1681)', t => {
		t.throws( () => {
			Ractive.extend({
				template: '{{yield "<p>nope</p>"}}'
			});
		}, /expected legal partial name/ );
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
		let widget = Ractive.extend({
			template: '{{yield foo}}'
		});

		let Base = Ractive.extend({
			components: { widget }
		});

		let Step1 = Base.extend();
		let Step2 = Step1.extend();
		let Step3 = Step2.extend({
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
				t.ok( /Could not find template for partial "missing"/.test( msg ) );
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
}
