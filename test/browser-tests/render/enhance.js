import { test } from 'qunit';

test( 'progressive enhancement of simple templates should reuse matching structure', t => {
	const str = fixture.innerHTML = 'testing <div class="foo">this is a <strong>test</strong><ul><li>1</li><li>2</li><li>3</li></ul></div> 123';
	const div = fixture.querySelector( 'div' ), li = fixture.querySelectorAll( 'li' )[2];
	div.found = true;
	li.found = true;

	const r = new Ractive({
		el: fixture,
		template: '{{first}} <div class="{{two + three}}o">{{>four}}<ul>{{#each five}}<li>{{.}}</li>{{/each}}</ul></div>{{#if six}}345{{else}} 123{{/if}}',
		data: {
			first: 'testing',
			two: 'f',
			three: 'o',
			five: [ 1, 2, 3 ],
			six: false
		},
		partials: {
			four: 'this is a <strong>{{first.substr(0, 4)}}</strong>'
		},
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, str );
	t.ok( r.find( 'div' ).found );
	t.ok( r.findAll( 'li' )[2].found );
});

// PHANTOMJS, Y U NO LIKE THIS TEST?!!?!!1!!one!!
if ( !/phantom/i.test( navigator.userAgent ) ) {
	test( 'progressive enhancement with mismatched simple template should make it match', t => {
		const str = 'testing <div class="foo">this is a <strong>test</strong><ul><li>1</li><li>2</li><li>3</li></ul></div> 123';
		fixture.innerHTML = 'testing <div class="bar">this is a <em>test</em><ul><li>1</li><li>3</li></ul></div>';
		const div = fixture.querySelector( 'div' );
		div.found = true;

		const r = new Ractive({
			el: fixture,
			template: '{{first}} <div class="{{two + three}}o">{{>four}}<ul>{{#each five}}<li>{{.}}</li>{{/each}}</ul></div>{{#if six}}345{{else}} 123{{/if}}',
			data: {
				first: 'testing',
				two: 'f',
				three: 'o',
				five: [ 1, 2, 3 ],
				six: false
			},
			partials: {
				four: 'this is a <strong>{{first.substr(0, 4)}}</strong>'
			},
			enhance: true
		});

		t.htmlEqual( fixture.innerHTML, str );
		t.ok( r.find( 'div' ).found );
	});
}

test( 'progressive enhancement should work with components', t => {
	const str = '<ul><li class="apples1">1</li><li class="oranges2">2</li></ul>';
	fixture.innerHTML = str;
	const li = fixture.querySelectorAll( 'li' )[1];
	li.found = true;

	const Item = Ractive.extend({
		template: '<li class="{{name}}{{idx}}">{{idx}}</li>'
	});

	const r = new Ractive({
		el: fixture,
		components: { Item },
		template: '<ul>{{#each items}}<Item name="{{.}}" idx="{{@index + 1}}" />{{/each}}</ul>',
		data: {
			items: [ 'apples', 'oranges' ]
		},
		enhance: true
	});

	t.htmlEqual( fixture.innerHTML, str );
	t.ok( r.findAll( 'li' )[1].found );
});
