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
			console.log( 'test 1 start' );
			var ractive = new Ractive({
				el: 'body',
				template: `
					{{#each Array(250) }}
						<foo/>
					{{/each}}`
			});
			console.log( 'test 1 end' );
		}
	},

	{
		name: 'update implicit mappings',
		setup: () => {
			console.log( 'setting up' );
			Ractive.components.foo = Ractive.extend({
				template: '<bar/>'
			});

			Ractive.components.bar = Ractive.extend({
				template: '<baz/>'
			});

			Ractive.components.baz = Ractive.extend({
				template: '{{message}}'
			});

			console.group( 'init' );
			var ractive = new Ractive({
				el: 'body',
				template: `
					{{#each Array(250) }}
						<foo/>
					{{/each}}`
			});
			console.groupEnd();

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
			console.log( 'test 1 start' );
			var ractive = new Ractive({
				el: 'body',
				template: `
					{{#each Array(250) }}
						<foo/>
					{{/each}}`
			});
			console.log( 'test 1 end' );
		}
	},

	{
		name: 'update explicit mappings',
		setup: () => {
			console.log( 'setting up' );
			Ractive.components.foo = Ractive.extend({
				template: '<bar message="{{message}}"/>'
			});

			Ractive.components.bar = Ractive.extend({
				template: '<baz message="{{message}}"/>'
			});

			Ractive.components.baz = Ractive.extend({
				template: '{{message}}'
			});

			console.group( 'init' );
			var ractive = new Ractive({
				el: 'body',
				template: `
					{{#each Array(250) }}
						<foo/>
					{{/each}}`
			});
			console.groupEnd();

			return ractive;
		},
		test: ractive => {
			ractive.set( 'message', 'hello' );
		}
	}
];
