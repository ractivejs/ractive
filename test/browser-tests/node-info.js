import { test } from 'qunit';
import { initModule } from './test-config';

export default function() {
	initModule('node-info.js');

	test( 'node info relative data get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 'yep' } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		t.equal( info.get( '../bat' ), 'yep' );
	});

	test( 'node info alias data get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo as wat}}{{#wat.bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 'yep' } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		t.equal( info.get( 'wat.bat' ), 'yep' );
	});

	test( 'node info index ref get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items:i}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep' } ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		t.equal( info.get( 'i' ), 0 );
	});

	test( 'node info key ref get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each obj:k}}<span />{{/each}}`,
			data: { obj: { foo: 'yep' } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		t.equal( info.get( 'k' ), 'foo' );
	});

	test( 'node info index ref get' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep' } ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		t.equal( info.get( '@index' ), 0 );
	});

	test( 'node info relative set' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep' } ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.set( '.foo', 'ha' );
		t.equal( r.get( 'items.0.foo' ), 'ha' );
	});

	test( 'node info alias set' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items as item}}<span />{{/each}}`,
			data: { items: [ { foo: 'yep' } ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.set( 'item.foo', 'ha' );
		t.equal( r.get( 'items.0.foo' ), 'ha' );
	});

	test( 'node info add' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 41 } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.add( '../bat' );
		t.equal( r.get( 'foo.bat' ), 42 );
		info.add( '../bat', 42 );
		t.equal( r.get( 'foo.bat' ), 84 );
	});

	test( 'node info subtract' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 41 } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.subtract( '../bat' );
		t.equal( r.get( 'foo.bat' ), 40 );
		info.subtract( '../bat', 42 );
		t.equal( r.get( 'foo.bat' ), -2 );
	});

	test( 'node info animate', t => {
		var done = t.async();
		t.expect( 1 );

		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 41 } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.animate( '../bat', 22 ).then(() => {
			t.equal( r.get( 'foo.bat' ), 22 );
			done();
		}, done);
	});

	test( 'node info toggle' , t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo}}{{#bar}}<span>hello</span>{{/}}{{/with}}`,
			data: { foo: { bar: { baz: true }, bat: 'yep' } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.toggle( '.baz' );
		t.equal( r.get( 'foo.bar.baz' ), false );
	});

	test( 'node info update', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getNodeInfo( r.find( 'input' ) );
		r.get( 'foo.bar' ).baz = 'yep';
		info.update( '.baz' );
		t.equal( r.get( 'foo.bar.baz' ), 'yep' );
	});

	test( 'node info updateModel', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const input = r.find( 'input' );
		input.value = 'yep';
		const info = Ractive.getNodeInfo( input );
		info.updateModel( '.baz' );
		t.equal( r.get( 'foo.bar.baz' ), 'yep' );
	});

	test( 'node info link', t => {
		const r = new Ractive({
			el:fixture,
			template: `{{#with foo.bar}}<span />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.link( '.baz', '~/str' );
		t.equal( r.get( 'str' ), 'hello' );
	});

	test( 'node info unlink', t => {
		const r = new Ractive({
			el:fixture,
			template: `{{#with foo.bar}}<span />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.link( '.baz', '~/str' );
		t.equal( r.get( 'str' ), 'hello' );
		info.unlink( 'str' );
		info.set( '.baz', 'yep' );
		t.ok( r.get( 'str' ) !== 'yep' );
	});

	test( 'node info merge', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.merge( '../', [ 1, 2 ] );

		t.equal( r.findAll( 'span' ).length, 2 );
	});

	test( 'node info push', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.push( '../', 1 );

		t.equal( r.findAll( 'span' ).length, 2 );
	});

	test( 'node info pop', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.pop( '../' );

		t.equal( r.findAll( 'span' ).length, 0 );
	});

	test( 'node info shift', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.shift( '../' );

		t.equal( r.findAll( 'span' ).length, 0 );
	});

	test( 'node info unshift', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.unshift( '../', 1 );

		t.equal( r.findAll( 'span' ).length, 2 );
	});

	test( 'node info splice', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#each items}}<span />{{/each}}`,
			data: { items: [ 0, 1 ] }
		});

		const info = Ractive.getNodeInfo( r.find( 'span' ) );

		info.splice( '../', 0, 1, 3, 2 );

		t.equal( r.findAll( 'span' ).length, 3 );
		t.equal( r.get( 'items.0' ), 3 );
	});

	test( 'node info isBound', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} /> <input value="test" />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		let info = Ractive.getNodeInfo( r.findAll( 'input' )[0] );
		t.ok( info.isBound() );
		info = Ractive.getNodeInfo( r.findAll( 'input' )[1] );
		t.ok( !info.isBound() );
	});

	test( 'node info two-way binding path', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getNodeInfo( r.find( 'input' ) );
		t.equal( info.getBindingPath(), 'foo.bar.baz' );
	});

	test( 'node info two-way binding get value', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getNodeInfo( r.find( 'input' ) );
		t.equal( info.getBinding(), 'hello' );
	});

	test( 'node info two-way binding set value', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<input value={{.baz}} />{{/with}}`,
			data: { foo: { bar: { baz: 'hello' } } }
		});

		const info = Ractive.getNodeInfo( r.find( 'input' ) );
		info.setBinding( 'yep' );
		t.equal( r.get( 'foo.bar.baz' ), 'yep' );
	});

	test( 'node info with query selector', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<span id="baz">yep</span>{{/with}}`,
			data: { foo: { bar: { baz: true } } }
		});

		t.equal( Ractive.getNodeInfo( '#baz' ).resolve(), 'foo.bar' );
	});

	test( 'node info from instance', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<span id="baz">yep</span>{{/with}}`,
			data: { foo: { bar: { baz: true } } }
		});

		t.equal( r.getNodeInfo( r.find( '#baz' ) ).resolve(), 'foo.bar' );
	});

	test( 'node info from instance with selector', t => {
		const r = new Ractive({
			el: fixture,
			template: `{{#with foo.bar}}<span id="baz">yep</span>{{/with}}`,
			data: { foo: { bar: { baz: true } } }
		});

		t.equal( r.getNodeInfo( '#baz' ).resolve(), 'foo.bar' );
	});
}
