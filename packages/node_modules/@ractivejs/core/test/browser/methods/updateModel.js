import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'methods/updateModel.js' );

	test( 'Works across component boundary', t => {
		const widget = Ractive.extend({
			template: '{{bar}}'
		});

		const ractive = new Ractive({
			el: fixture,
			template: `<input value='{{foo.bar}}'/><widget bar='{{foo.bar}}'/>`,
			data: {
				foo: {
					bar: 'change me'
				}
			},
			components: {
				widget
			}
		});

		ractive.find( 'input' ).value = 'changed';
		ractive.updateModel( 'foo' );
		t.equal( ractive.get( 'foo.bar' ), 'changed' );

		t.equal( fixture.innerHTML, '<input value="changed">changed' );
		t.equal( ractive.findComponent( 'widget' ).get( 'bar' ), 'changed' );
	});

	test( 'one-way bindings can be used to update the model (#1963)', t => {
		const cmp = Ractive.extend({
			twoway: false,
			template: '<input value="{{obj.foo}}" /><input value="{{obj[obj.key]}}" /><input type="checkbox" checked="{{obj.bar.baz}}" />'
		});
		const r = new Ractive({
			el: fixture,
			template: '<cmp obj="{{some.thing}}" />',
			data: {
				some: {
					thing: {
						key: 'test',
						test: 'wat',
						foo: 'str',
						bar: { baz: false }
					}
				}
			},
			components: { cmp }
		});

		const [ larry, curly, moe ] = r.findAll( 'input' );

		larry.value = 'larry';
		curly.value = 'curly';
		moe.checked = true;

		r.updateModel();

		t.equal( r.get( 'some.thing.foo' ), 'larry' );
		t.equal( r.get( 'some.thing.test' ), 'curly' );
		t.equal( r.get( 'some.thing.bar.baz' ), true );
	});
}
