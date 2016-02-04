import { test } from 'qunit';
import { fire } from 'simulant';

test( 'event is added and removed with conditional', t => {
	const r = new Ractive({
		el: fixture,
		template: `<a {{#if foo}}on-click="add('count')"{{/if}}>click me</a>`,
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
		template: `<a {{#if foo}}on-click="add('count1')"{{else}}on-click="add('count2')"{{/if}}>click me</a>`,
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
