import { test } from 'qunit';

test( 'use context to resolve set path if given', t => {
	const r = new Ractive({
		el: fixture,
		template: `{{#with foo.bar.baz.bat}}<span>{{.last}}</span>{{/with}}`
	});

	r.set( '.last', 'yep', r.find( 'span' ) );
	t.htmlEqual( fixture.innerHTML, '<span>yep</span>' );

	r.set( '../wat', 'again, yep', r.find( 'span' ) );
	t.equal( r.get( 'foo.bar.baz.wat' ), 'again, yep' );
});

test( 'context resolved sets can also use aliases', t => {
	const r = new Ractive({
		el: fixture,
		template: `{{#with foo.bar as alias}}<span>{{foo.bar.val}}</span>{{/with}}`,
		data: { foo: { bar: { val: 'nope' } } }
	});

	r.set( 'alias.val', 'yep', r.find( 'span' ) );
	t.htmlEqual( fixture.innerHTML, '<span>yep</span>' );
});
