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
					{{#each Array(250) }}
						<foo/>
					{{/each}}`
			});
		}
	},

	{
		name: 'update implicit mappings',
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

			var ractive = new Ractive({
				el: 'body',
				template: `
					{{#each Array(250) }}
						<foo/>
					{{/each}}`
			});

			return ractive;
		},
		test: ractive => {
			ractive.set( 'message', 'hello' );
		}
	},

	{
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
					{{#each Array(250) }}
						<foo/>
					{{/each}}`
			});
		}
	},

	{
		name: 'update explicit mappings',
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

			var ractive = new Ractive({
				el: 'body',
				template: `
					{{#each Array(250) }}
						<foo/>
					{{/each}}`
			});

			return ractive;
		},
		test: ractive => {
			ractive.set( 'message', 'hello' );
		}
	}
];
