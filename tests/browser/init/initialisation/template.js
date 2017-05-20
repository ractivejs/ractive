import { afterEach, initModule } from '../../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	const defaultData = Ractive.defaults.data;
	const defaultTemplate = Ractive.defaults.template;

	afterEach( () => {
		Ractive.defaults.data = defaultData;
		Ractive.defaults.template = defaultTemplate;
	});

	initModule( 'init/initialisation/template.js' );

	function createScriptTemplate ( template ) {
		const script = document.createElement( 'SCRIPT' );

		fixture.appendChild( script );
		script.id = 'template';
		script.setAttribute( 'type', 'text/ractive' );
		script.textContent = template;
	}

	test( 'hash is retrieved from element Id', t => {
		createScriptTemplate( '{{foo}}' );

		new Ractive({
			el: fixture,
			template: '#template',
			data: { foo: 'bar' }
		});

		t.equal( fixture.innerHTML, 'bar' );
	});

	test( 'non-existant element id throws', t => {
		t.throws( () => {
			new Ractive({
				el: fixture,
				template: '#nonexistant'
			});
		});
	});

	test( 'Ractive.defaults.template used on initialize', t => {
		Ractive.defaults.template = '{{foo}}';

		new Ractive({
			el: fixture,
			data: { foo: 'bar' }
		});

		t.equal( fixture.innerHTML, 'bar' );
	});

	test( 'Ractive.defaults.template function called on initialize', t => {
		Ractive.defaults.template = () => '{{foo}}';

		new Ractive( {
			el: fixture,
			data: { foo: 'bar' }
		});

		t.equal( fixture.innerHTML, 'bar' );
	});

	test( 'template function has helper object', t => {
		t.expect( 3 );

		createScriptTemplate( '{{foo}}' );

		Ractive.defaults.template = helper => {
			let template = helper.fromId( 'template' );
			template += '{{bar}}';
			t.ok( !helper.isParsed( template ) );
			template = helper.parse( template );
			t.ok( helper.isParsed( template ) );
			return template;
		};

		new Ractive( {
			el: fixture,
			data: { foo: 'fizz', bar: 'bizz' }
		});

		t.equal( fixture.innerHTML, 'fizzbizz' );
	});

	test( 'non-script tag for template throws error', t => {
		const div = document.createElement( 'DIV' );
		div.id = 'template';
		fixture.appendChild( div );

		t.throws( () => {
			new Ractive({
				el: fixture,
				template: '#template'
			});
		}, /script/ );
	});

	test('Override empty component template', t => {
		const Component = Ractive.extend({ template: '' });
		const instance = Component({ template: '{{ foo }}' });

		t.deepEqual(instance.template, [{ r: 'foo', t: 2 }]);
	});

	test('Override non-empty component template', t => {
		const Component = Ractive.extend({ template: '{{ foo }}' });
		const instance = Component({ template: '{{ bar }}' });

		t.deepEqual(instance.template, [{ r: 'bar', t: 2 }]);
	});

	test('String template', t => {
		const Component = Ractive.extend({ template: '' });
		const instance = Component({ template: 'foo' });

		t.deepEqual(instance.template, ['foo']);
	});

	test('Function template', t => {
		const Component = Ractive.extend({ template: '' });
		const instance = Component({ template: () => '{{ foo }}' });

		t.deepEqual(instance.template, [{ r: 'foo', t: 2 }]);
	});

	test('Uses component parse options on inherited template', t => {
		const Component = Ractive.extend({ template: '<#foo#>', delimiters: ['<#', '#>'] });
		const instance = Component();

		t.deepEqual(instance.template, [{ r: 'foo', t: 2 }]);
	});

	test('Uses component parse options on overridden template', t => {
		const Component = Ractive.extend({ template: '<#foo#>', delimiters: ['<#', '#>'] });
		const instance = Component({ template: '<#bar#>' });

		t.deepEqual(instance.template, [{ r: 'bar', t: 2 }]);
	});

	test('Replace component template after extend, before instantiation', t => {
		const Component = Ractive.extend({ template: '{{ foo }}' });
		Component.defaults.template = '{{ bar }}';

		const instance = Component();

		t.deepEqual(instance.template, [{ r: 'bar', t: 2 }]);
	});

}
