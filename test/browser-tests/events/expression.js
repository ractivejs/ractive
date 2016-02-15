import { test } from 'qunit';
import { fire } from 'simulant';

test( 'events can be handled as expressions', t => {
	const r = new Ractive({
		el: fixture,
		template: `<button on-click="@ractive.set('foo', 42)">click me</button>`,
		data: { foo: 'nope' }
	});
	const button = r.find( 'button' );

	simulant.fire( button, 'click' );

	t.equal( r.get( 'foo' ), 42 );
});
