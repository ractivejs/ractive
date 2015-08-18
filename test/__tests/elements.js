module( 'elements' );

test( 'option element with custom selected logic works without error and correctly', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: `
			<select>
				{{#options}}
					<option value="{{.}}" selected="{{.===selected}}">{{.}}</option>
				{{/options}}
			</select>`,
		data: {
			selected: 2,
			options: [1,2,3]
		}
	});

	t.equal( ractive.find('select').value , 2 );
});

test( 'Input with uppercase tag name binds correctly', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: "<INPUT value='{{val}}'>{{val}}",
		data: { val: 'foo' }
	});

	ractive.find('input').value = 'bar';
	ractive.updateModel();
	t.htmlEqual( fixture.innerHTML, '<input>bar' );
});

test( 'Elements with id are registered and unregistered with ractive.nodes', function ( t ) {
	var ractive = new Ractive({
		el: fixture,
		template: "{{#hasP}}<p id='foo'></p>{{/}}",
		data: {
			hasP: true
		}
	});

	t.equal( ractive.nodes.foo, ractive.find('p') );
	ractive.set( 'hasP', false );
	t.ok( !ractive.nodes.foo );
});

test( 'Elements with dynamic id is unregistered with ractive.nodes on change', function ( t ) {
	var p, ractive = new Ractive({
		el: fixture,
		template: "<p id='{{id}}'></p>",
		data: {
			id: 'foo'
		}
	});

	p = ractive.find('p');
	t.equal( ractive.nodes.foo, p );
	ractive.set( 'id', 'bar' );
	t.ok( !ractive.nodes.foo );
	t.equal( ractive.nodes.bar, p );
});

test( 'Textarea is stringified correctly', function ( t ) {
	var ractive = new Ractive({
		template: '<textarea value="123<div></div>"></textarea>'
	});

	t.equal( ractive.toHTML(), '<textarea>123&lt;div&gt;&lt;/div&gt;</textarea>' );
});

test( 'Wildcard proxy-events invalid on elements', t => {
	expect( 1 );

	t.throws( () => {
		new Ractive({
			el: fixture,
			debug: true,
			template: '<p on-foo.*="foo"></p>'
		});
	}, /wildcards/ );
});

if ( 'draggable' in document.createElement( 'div' ) ) {
	test( 'draggable attribute is handled correctly (#1780)', t => {
		let ractive = new Ractive({
			el: fixture,
			template: '<div draggable="true" /><div draggable="false" /><div draggable="" /><div draggable /><div draggable="{{true}}" /><div draggable="{{false}}" /><div draggable="{{empty}}" />'
		});

		let divs = ractive.findAll( 'div' );
		t.equal( divs[0].draggable, true );
		t.equal( divs[1].draggable, false );
		t.equal( divs[2].draggable, false );
		t.equal( divs[3].draggable, false );
		t.equal( divs[4].draggable, true );
		t.equal( divs[5].draggable, false );
		t.equal( divs[6].draggable, false );

		ractive.set( 'empty', true );
		t.equal( divs[6].draggable, true );
		ractive.set( 'empty', 'potato' );
		t.equal( divs[6].draggable, false );
	});
}

if ( 'registerElement' in document ) {
	test( '"is" attribute is handled correctly for custom elements (#2043)', t => {
		let XFoo = document.registerElement('x-foo', {
			prototype: Object.create(HTMLParagraphElement.prototype, {
				testMember: { value: true }
			}),
			extends: 'p'
		});
		let ractive = new Ractive({
			el: fixture,
			template: '<p is="x-foo"></p>'
		});

		let p = ractive.find( 'p' );
		t.ok( 'testMember' in p );
	});
}
