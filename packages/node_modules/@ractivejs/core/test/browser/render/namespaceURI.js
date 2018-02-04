import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'render/namespaceURI.js' );

	if ( Ractive.svg ) {
		const html = 'http://www.w3.org/1999/xhtml';
		const svg = 'http://www.w3.org/2000/svg';

		test( 'Top-level elements have html namespace by default', t => {
			const ractive = new Ractive({
				el: fixture,
				template: `<p>html</p>`
			});

			t.equal( ractive.find( 'p' ).namespaceURI, html );
		});

		test( 'SVG elements have svg namespace', t => {
			const ractive = new Ractive({
				el: fixture,
				template: `<svg><text>svg</text></svg>`
			});

			t.equal( ractive.find( 'svg' ).namespaceURI, svg );
			t.equal( ractive.find( 'text' ).namespaceURI, svg );
		});

		test( 'Top-level elements inherit SVG namespaceURI where appropriate', t => {
			const ractive = new Ractive({
				el: document.createElementNS( svg, 'svg' ),
				template: '<text>svg</text>'
			});

			t.equal( ractive.find( 'text' ).namespaceURI, svg );
		});

		test( 'Triples inside SVG elements result in correct namespaceURI', t => {
			const ractive = new Ractive({
				el: document.createElementNS( svg, 'svg' ),
				template: '{{{code}}}',
				data: {
					code: '<text>works</text>'
				}
			});

			const text = ractive.find( 'text' );
			t.ok( !!text );
			t.equal( text.namespaceURI, svg );
		});

		test( 'Children of foreignObject elements default to html namespace (#713)', t => {
			const ractive = new Ractive({
				el: fixture,
				template: '<svg><foreignObject><p>foo</p></foreignObject></svg>'
			});

			// We can't do `ractive.find( 'foreignObject' )` because of a longstanding browser bug
			// (https://bugs.webkit.org/show_bug.cgi?id=83438)
			t.equal( ractive.find( 'svg' ).firstChild.namespaceURI, svg );
			t.equal( ractive.find( 'p' ).namespaceURI, html );
		});

		test( 'Top-level elements in components have the correct namespace (#953)', t => {
			const ractive = new Ractive({
				el: fixture,
				template: '<svg><widget message="yup"/></svg>',
				components: {
					widget: Ractive.extend({
						template: '<text>{{message}}</text>'
					})
				}
			});

			t.equal( ractive.find( 'text' ).namespaceURI, svg );
			t.htmlEqual( fixture.innerHTML, '<svg><text>yup</text></svg>' );
		});

		test( 'Custom namespaces are supported (#2038)', t => {
			new Ractive({
				el: fixture,
				template: `
				<svg xmlns='http://www.w3.org/2000/svg' xmlns:v='http://schemas.microsoft.com/visio/2003/SVGExtensions/' >
				<v:documentProperties v:langID='2057' v:viewMarkup='false'></v:documentProperties>
				</svg>`
			});

			const documentProperties = fixture.firstElementChild.firstElementChild;
			t.equal( documentProperties.namespaceURI, 'http://www.w3.org/2000/svg' );
		});

		test( 'Namespaced attributes are set correctly', t => {
			const ractive = new Ractive({
				template: '<svg><use xlink:href="#yup" /></svg>'
			});

			ractive.render( fixture );

			t.equal(ractive.find('use').getAttributeNS('http://www.w3.org/1999/xlink', 'href'), '#yup');
		});
	}
}
