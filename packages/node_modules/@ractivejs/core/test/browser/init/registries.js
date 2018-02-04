import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'init/registries.js' );

	test( 'has globally registered', t => {
		const noop = () => {};
		const registriesInDefaults = [ 'computed' ];
		const registriesAndDefinition = {
			adaptors: {},
			components: Ractive.extend({}),
			computed: noop,
			decorators: noop,
			easing: noop,
			events: noop,
			interpolators: noop,
			partials: '',
			transitions: noop,
		};

		Object.keys(registriesAndDefinition).forEach(name => {
			const definition = registriesAndDefinition[name];
			const isRegistryInDefaults = registriesInDefaults.indexOf(name) > -1;
			const registryLocation = isRegistryInDefaults ? Ractive.defaults : Ractive;
			const ractive = new Ractive({});

			registryLocation[name].foo = definition;

			t.ok(registryLocation.hasOwnProperty(name), `should have ${name} global registry`);
			t.strictEqual(ractive[name].foo, registryLocation[name].foo, `should have ${name} reference on instance`);

			delete registryLocation[name].foo;
		});

	});

}
