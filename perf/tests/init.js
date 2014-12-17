/*global Ractive */
var tests = [
	{
		name: 'initialise implicit mappings',
		setup: () => {
			Ractive.components.foo = Ractive.extend({
				template: '<bar/>'
			});

			Ractive.components.bar = Ractive.extend({
				template: '<baz/>'
			});

			Ractive.components.baz = Ractive.extend({
				template: '{{message}}'
			});
		},
		test: () => {
			var ractive = new Ractive({
				el: 'body',
				template: `
					{{#each Array(50) }}
						<foo/>
					{{/each}}`
			});
		}
	},

	{
		solo: true,
		name: 'initialise explicit mappings',
		setup: () => {
			Ractive.components.foo = Ractive.extend({
				template: '<bar message="{{message}}"/>'
			});

			Ractive.components.bar = Ractive.extend({
				template: '<baz message="{{message}}"/>'
			});

			Ractive.components.baz = Ractive.extend({
				template: '{{message}}'
			});
		},
		test: () => {
			var ractive = new Ractive({
				el: 'body',
				template: `
					{{#each Array(50) }}
						<foo/>
					{{/each}}`
			});
		}
	}
];
