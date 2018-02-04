import { fire } from 'simulant';
import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'events/conditional.js' );

	test( 'event is added and removed with conditional', t => {
		const r = new Ractive({
			el: fixture,
			template: `<a {{#if foo}}on-click="@this.add('count')"{{/if}}>click me</a>`,
			data: { foo: true, count: 0 }
		});

		const a = r.find( 'a' );

		fire( a, 'click' );
		t.equal( r.get( 'count' ), 1 );

		r.set( 'foo', false );
		fire( a, 'click' );
		t.equal( r.get( 'count' ), 1 );

		r.set( 'foo', true );
		fire( a, 'click' );
		t.equal( r.get( 'count' ), 2 );
	});

	test( 'events work with else', t => {
		const r = new Ractive({
			el: fixture,
			template: `<a {{#if foo}}on-click="@this.add('count1')"{{else}}on-click="@this.add('count2')"{{/if}}>click me</a>`,
			data: { count1: 0, count2: 0 }
		});

		const a = r.find( 'a' );

		fire( a, 'click' );
		t.equal( r.get( 'count1' ), 0 );
		t.equal( r.get( 'count2' ), 1 );

		r.set( 'foo', true );
		fire( a, 'click' );
		t.equal( r.get( 'count1' ), 1 );
		t.equal( r.get( 'count2' ), 1 );

		r.toggle( 'foo' );
		fire( a, 'click' );
		t.equal( r.get( 'count1' ), 1 );
		t.equal( r.get( 'count2' ), 2 );
	});

	test( `conditional event listeners work with components`, t => {
		let count = 0;
		const r1 = Ractive.extend({
			template: ''
		});
		const r = new Ractive({
			el: fixture,
			template: '<foo {{#if go}}on-bar="@this.foo()"{{/if}} />',
			foo () { count++; },
			components: { foo: r1 }
		});

		const foo = r.findComponent( 'foo' );
		foo.fire( 'bar' );
		t.equal( count, 0 );
		r.set( 'go', true );
		foo.fire( 'bar' );
		t.equal( count, 1 );
	});

	test( `conditional event listeners work with anchors`, t => {
		let count = 0;
		const r1 = new Ractive({
			template: ''
		});
		const r = new Ractive({
			el: fixture,
			template: '<#foo {{#if go}}on-bar="@this.foo()"{{/if}} />',
			foo () { count++; }
		});

		r.attachChild( r1, { target: 'foo' } );
		r1.fire( 'bar' );
		t.equal( count, 0 );
		r.set( 'go', true );
		r1.fire( 'bar' );
		t.equal( count, 1 );
	});
}
