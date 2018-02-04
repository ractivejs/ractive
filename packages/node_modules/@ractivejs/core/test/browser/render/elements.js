/*global document, HTMLParagraphElement */
import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'render/elements.js' );

	test( 'option element with custom selected logic works without error and correctly', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `
				<select>
					{{#options}}
						<option value="{{.}}" selected="{{.===selected}}">{{.}}</option>
					{{/options}}
				</select>`,
			data: {
				selected: 2,
				options: [ 1, 2, 3 ]
			}
		});

		t.equal( ractive.find('select').value , 2 );
	});

	test( 'element inside option is an error', t => {
		t.throws( () => {
			new Ractive({
				el: fixture,
				template: '<select><option><blink/></option></select>'
			});
		}, /An <option> element cannot contain other elements \(encountered <blink>\)/ );
	});

	test( 'Input with uppercase tag name binds correctly', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `<INPUT value='{{val}}'>{{val}}`,
			data: { val: 'foo' }
		});

		ractive.find('input').value = 'bar';
		ractive.updateModel();
		t.htmlEqual( fixture.innerHTML, '<input>bar' );
	});

	test( 'Textarea is stringified correctly', t => {
		const ractive = new Ractive({
			template: '<textarea value="123<div></div>"></textarea>'
		});

		t.equal( ractive.toHTML(), '<textarea>123&lt;div&gt;&lt;/div&gt;</textarea>' );
	});

	test( 'Wildcard proxy-events invalid on elements', t => {
		t.expect( 1 );

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
			const ractive = new Ractive({
				el: fixture,
				template: '<div draggable="true" /><div draggable="false" /><div draggable="" /><div draggable /><div draggable="{{true}}" /><div draggable="{{false}}" /><div draggable="{{empty}}" />'
			});

			const divs = ractive.findAll( 'div' );
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
			document.registerElement( 'x-foo', {
				prototype: Object.create( HTMLParagraphElement.prototype, {
					testMember: { value: true }
				}),
				extends: 'p'
			});

			const ractive = new Ractive({
				el: fixture,
				template: '<p is="x-foo"></p>'
			});

			const p = ractive.find( 'p' );
			t.ok( 'testMember' in p );
		});
	}

	test( 'svg elements contributed by a component should have the correct namespace - #2621', t => {
		t.expect( 7 );
		const svg = 'http://www.w3.org/2000/svg';
		const point = Ractive.extend({
			template: '<circle x="{{.x}}" y="{{.y}}" r="{{.r}}"></circle>'
		});
		const r = new Ractive({
			el: fixture,
			template: '<svg><g>{{#each points}}{{>.type}}{{/each}}</g></svg>',
			data: {
				points: [
					{ x: 10, y: 10, r: 10, type: 'point' },
					{ x: 20, y: 20, r: 2, type: 'point' }
				]
			},
			partials: {
				point: '<point />'
			},
			components: { point }
		});

		t.equal( r.findAll( 'circle' ).length, 2 );
		r.findAll( 'circle' ).forEach( e => t.equal( e.namespaceURI, svg ) );
		r.push( 'points', { x: 50, y: 50, r: 10, type: 'point' } );
		t.equal( r.findAll( 'circle' ).length, 3 );
		r.findAll( 'circle' ).forEach( e => t.equal( e.namespaceURI, svg ) );
	});
}
