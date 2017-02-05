import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/attachChild.js' );

	test( 'child instances can be attached to an anchor', t => {
		const r1 = new Ractive({
			template: '<#foo />',
			el: fixture
		});
		const r2 = new Ractive({
			template: 'hello'
		});

		t.equal( fixture.innerHTML, '' );
		r1.attachChild( r2, { target: 'foo' } );
		t.equal( fixture.innerHTML, 'hello' );
	});

	test( 'targeted child instances are rendered and unrendered with their anchor', t => {
		const r1 = new Ractive({
			template: '{{#if show}}<#foo />{{/if}}',
			el: fixture
		});
		const r2 = new Ractive({
			template: 'hello'
		});

		t.equal( fixture.innerHTML, '' );
		r1.attachChild( r2, { target: 'foo' } );
		t.equal( fixture.innerHTML, '' );
		r1.set( 'show', true );
		t.equal( fixture.innerHTML, 'hello' );
		r1.set( 'show', false );
		t.equal( fixture.innerHTML, '' );
	});

	test( 'non-targeted instances stay where they are when attached', t => {
		fixture.innerHTML = '<div id="r1"></div><div id="r2"></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: 'r1'
		});
		const r2 = new Ractive({
			el: fixture.children[1],
			template: 'r2'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1</div><div id="r2">r2</div>' );
		r1.attachChild( r2 );
		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1</div><div id="r2">r2</div>' );
	});

	test( 'targeted instances are unrendered before being attached', t => {
		fixture.innerHTML = '<div id="r1"></div><div id="r2"></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: 'r1<#foo />'
		});
		const r2 = new Ractive({
			el: fixture.children[1],
			template: 'r2'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1</div><div id="r2">r2</div>' );
		r1.attachChild( r2, { target: 'foo' } );
		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1r2</div><div id="r2"></div>' );
	});

	test( 'targeted instances are unrendered event if their anchor doesn\'t exist when attached', t => {
		fixture.innerHTML = '<div id="r1"></div><div id="r2"></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: 'r1'
		});
		const r2 = new Ractive({
			el: fixture.children[1],
			template: 'r2'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1</div><div id="r2">r2</div>' );
		r1.attachChild( r2, { target: 'foo' } );
		t.htmlEqual( fixture.innerHTML, '<div id="r1">r1</div><div id="r2"></div>' );
	});

	test( 'anchors render the attached chile with an index corresponding to their position in the template', t => {
		const r1 = new Ractive({
			template: '<#foo />',
			el: fixture
		});
		const r2 = new Ractive({
			template: 'hello'
		});
		const r3 = new Ractive({
			template: 'world'
		});

		t.equal( fixture.innerHTML, '' );
		r1.attachChild( r2, { target: 'foo' } );
		t.equal( fixture.innerHTML, 'hello' );
		r1.attachChild( r3, { target: 'foo' } );
		t.equal( fixture.innerHTML, 'hello' );
		r1.detachChild( r3 );
		t.equal( fixture.innerHTML, 'hello' );
		r1.detachChild( r2 );
		t.equal( fixture.innerHTML, '' );
	});

	test( 'same-named anchors distribute multiple attached children in template order by attached index', t => {
		const r1 = new Ractive({
			template: '{{#each @this.children.byName.foo}}<#foo />{{/each}}',
			el: fixture
		});
		const r2 = new Ractive({
			template: 'hello'
		});
		const r3 = new Ractive({
			template: 'world'
		});

		t.equal( fixture.innerHTML, '' );
		r1.attachChild( r2, { target: 'foo' } );
		t.equal( fixture.innerHTML, 'hello' );
		r1.attachChild( r3, { target: 'foo' } );
		t.equal( fixture.innerHTML, 'helloworld' );
		r1.detachChild( r2 );
		t.equal( fixture.innerHTML, 'world' );
		r1.detachChild( r3 );
		t.equal( fixture.innerHTML, '' );
	});

	test( 'attached children\'s events bubble to the parent', t => {
		fixture.innerHTML = '<div id="r1"></div><div id="r2"></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: 'r1<#foo />'
		});
		const r2 = new Ractive({
			el: fixture.children[1],
			template: 'r2'
		});

		let count = 0;
		r1.on( 'r2.test', () => count++ );

		r1.attachChild( r2, { name: 'r2' } );
		r2.fire( 'test' );
		r1.detachChild( r2 );
		r2.fire( 'test' );
		r1.attachChild( r2, { target: 'foo', name: 'r2' } );
		r2.fire( 'test' );

		t.equal( count, 2 );
	});

	test( 'attaching an already attached child throws an appropriate error', t => {
		const r1 = new Ractive({});
		const r2 = new Ractive({});

		r1.attachChild( r2 );

		t.throws( () => {
			r1.attachChild( r2 );
		}, /already attached.*this instance/ );
	});

	test( 'attaching child that is attached elsewhere throws an appropriate error', t => {
		const r1 = new Ractive({});
		const r2 = new Ractive({});
		const r3 = new Ractive({});

		r1.attachChild( r2 );

		t.throws( () => {
			r3.attachChild( r2 );
		}, /already attached.*different instance/ );
	});

	test( `attaching and detaching a child triggers transitions`, t => {
		let ins = 0;
		let outs = 0;
		function go ( trans ) {
			if ( trans.isIntro ) ins++;
			else outs++;
			trans.complete();
		}

		const r1 = new Ractive({
			el: fixture,
			template: '<#anchor />'
		});
		const r2 = new Ractive({
			transitions: { go },
			template: '<div go-in-out>...</div>'
		});

		r1.attachChild( r2, { target: 'anchor' } );
		r1.detachChild( r2 );

		t.equal( ins, 1 );
		t.equal( outs, 1 );
	});

	test( `transitions while detaching and reattaching child should carry on`, t => {
		let ins = 0;
		let outs = 0;
		const done = t.async();

		function go ( trans ) {
			if ( trans.isIntro ) ins++;
			else outs++;
			setTimeout( trans.complete, 50 );
		}

		const r1 = new Ractive({
			el: fixture,
			template: '<#a1 /><#a2 />'
		});
		const r2 = new Ractive({
			transitions: { go },
			template: '<div go-in-out>...</div>'
		});

		r1.attachChild( r2, { target: 'a1' } );
		t.htmlEqual( fixture.innerHTML, '<div>...</div>' );
		r1.detachChild( r2 );
		t.htmlEqual( fixture.innerHTML, '<div>...</div>' );
		r1.attachChild( r2, { target: 'a2' } );
		t.htmlEqual( fixture.innerHTML, '<div>...</div><div>...</div>' );
		r1.detachChild( r2 );
		t.htmlEqual( fixture.innerHTML, '<div>...</div><div>...</div>' );

		setTimeout( () => {
			t.equal( ins, 2 );
			t.equal( outs, 2 );

			t.equal( fixture.innerHTML, '' );
			done();
		}, 60 );
	});

	test( `anchors can supply mappings`, t => {
		const r1 = new Ractive({
			template: '{{foo}}'
		});

		const r2 = new Ractive({
			el: fixture,
			template: '<#foo foo="{{bar}}" />',
			data: {
				bar: 'yep',
				baz: 'still yep'
			}
		});

		t.htmlEqual( fixture.innerHTML, '' );
		r2.attachChild( r1, { target: 'foo' } );
		t.htmlEqual( fixture.innerHTML, 'yep' );
		r2.resetTemplate( '<#foo foo="{{baz}}" />' );
		t.htmlEqual( fixture.innerHTML, 'still yep' );
		r2.detachChild( r1 );
		t.htmlEqual( fixture.innerHTML, '' );
	});

	test( `children default to attach append`, t => {
		const r1 = new Ractive({
			template: 'r1'
		});
		const r2 = new Ractive({
			template: 'r2'
		});
		const r3 = new Ractive({
			template: 'r3'
		});
		const r = new Ractive({
			el: fixture,
			template: '<#foo /><#foo /><#foo />'
		});

		r.attachChild( r1, { target: 'foo' } );
		r.attachChild( r2, { target: 'foo' } );
		r.attachChild( r3, { target: 'foo', append: true } );
		t.htmlEqual( fixture.innerHTML, 'r1r2r3' );
	});

	test( `children can be attached prepend`, t => {
		const r1 = new Ractive({
			template: 'r1'
		});
		const r2 = new Ractive({
			template: 'r2'
		});
		const r = new Ractive({
			el: fixture,
			template: '<#foo /><#foo /><#foo />'
		});

		r.attachChild( r1, { target: 'foo' } );
		r.attachChild( r2, { target: 'foo', prepend: true } );
		t.htmlEqual( fixture.innerHTML, 'r2r1' );
	});

	test( `children can be inserted at a specific index`, t => {
		const r1 = new Ractive({
			template: 'r1'
		});
		const r2 = new Ractive({
			template: 'r2'
		});
		const r3 = new Ractive({
			template: 'r3'
		});
		const r4 = new Ractive({
			template: 'r4'
		});
		const r = new Ractive({
			el: fixture,
			template: '<#foo /><#foo /><#foo /><#foo />'
		});

		r.attachChild( r1, { target: 'foo' } );
		r.attachChild( r2, { target: 'foo' } );
		r.attachChild( r3, { target: 'foo', insertAt: 1 } );
		r.attachChild( r4, { target: 'foo', insertAt: 1 } );
		t.htmlEqual( fixture.innerHTML, 'r1r4r3r2' );
	});

	test( `attached children can have their templates reset`, t => {
		fixture.innerHTML = '<div id="r1-spot"></div><div id="r2-spot"></div>';
		const r1 = new Ractive({
			el: fixture.querySelector( '#r1-spot' ),
			template: 'r1'
		});
		const r2 = new Ractive({
			el: fixture.querySelector( '#r2-spot' ),
			template: 'r2'
		});

		t.htmlEqual( fixture.innerHTML, '<div id="r1-spot">r1</div><div id="r2-spot">r2</div>' );
		r2.attachChild( r1 );
		r1.resetTemplate( 'hey1' );
		r2.resetTemplate( 'hey2' );
		t.htmlEqual( fixture.innerHTML, '<div id="r1-spot">hey1</div><div id="r2-spot">hey2</div>' );
	});

	test( `attached anchored children can have their templates reset`, t => {
		const r1 = new Ractive({
			template: 'r1'
		});
		const r = new Ractive({
			el: fixture,
			template: '<#foo />'
		});

		r.attachChild( r1, { target: 'foo' } );
		t.htmlEqual( fixture.innerHTML, 'r1' );
		r1.resetTemplate( 'hey1' );
		t.htmlEqual( fixture.innerHTML, 'hey1' );
	});

	test( `attached anchored children can be supplied with inline partials`, t => {
		const r1 = new Ractive({
			template: '{{>thing}}{{>content}}'
		});
		const r = new Ractive({
			el: fixture,
			template: '<#foo>maybe{{#partial thing}}yep{{/partial}}</foo>'
		});

		t.equal( r1.toHTML(), '' );
		r.attachChild( r1, { target: 'foo' } );
		t.htmlEqual( fixture.innerHTML, 'yepmaybe' );
	});

	test( `anchors attach and detach event proxies`, t => {
		let count = 0;
		const r1 = new Ractive({
			template: ''
		});
		const r = new Ractive({
			el: fixture,
			template: '<#foo on-bar="@this.foo()" />',
			foo () { count++; }
		});

		r.attachChild( r1, { target: 'foo' } );
		r1.fire( 'bar' );
		t.equal( count, 1 );
		r.detachChild( r1 );
		r1.fire( 'bar' );
		t.equal( count, 1 );
	});

	test( 'attached children have their parent and root ref updated', t => {
		const p1 = new Ractive({
			data: { foo: 'p1' }
		});
		const p2 = new Ractive({
			data: { foo: 'p2' }
		});
		const c = new Ractive({
			el: fixture,
			template: '{{ @.parent._guid }} {{ @.root.data.foo }}',
			data: { foo: 'c' }
		});

		t.ok( !c.parent );

		p1.attachChild( c );
		t.ok( c.parent === p1 );
		t.ok( c.root === p1 );
		t.htmlEqual( fixture.innerHTML, `${p1._guid} p1` );
		p1.set( 'foo', '_p1' );
		t.htmlEqual( fixture.innerHTML, `${p1._guid} _p1` );

		p1.detachChild( c );
		t.ok( !c.parent );
		t.ok( c.root === c );
		t.htmlEqual( fixture.innerHTML, 'c' );
		c.set( 'foo', '_c' );
		t.htmlEqual( fixture.innerHTML, '_c' );

		p2.attachChild( c );
		t.ok( c.parent === p2 );
		t.ok( c.root === p2 );
		t.htmlEqual( fixture.innerHTML, `${p2._guid} p2` );
		p2.set( 'foo', '_p2' );
		t.htmlEqual( fixture.innerHTML, `${p2._guid} _p2` );

		p2.detachChild( c );
		t.ok( !c.parent );
		t.ok( c.root === c );
		t.htmlEqual( fixture.innerHTML, '_c' );
	});
}
