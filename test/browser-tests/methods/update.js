import { test } from 'qunit';

test( 'update can be called with context', t => {
	const r = new Ractive({
		el: fixture,
		template: `{{#with foo.bar}}<span>{{.baz}}</span>{{/with}}`,
		data: { foo: { bar: { baz: 'nope' } } }
	});

	const bar = r.get( 'foo.bar' );
	bar.baz = 'yep';

	t.htmlEqual( fixture.innerHTML, '<span>nope</span>' );
	r.update( '.baz', r.find( 'span' ) );
	t.htmlEqual( fixture.innerHTML, '<span>yep</span>' );
});
