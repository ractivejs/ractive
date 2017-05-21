suite('Initialization', () => {

	benchmark('Simple instance', function(){

		this.ractive = new Ractive({
			el: '#fixture',
			data: { message: 'Hello World!'	},
			template: '{{message}}'
		});

	}, {
		onCycle(){
			this.ractive.teardown();
		}
	});

	benchmark('Implicit component mappings', function() {

		this.ractive = new Ractive({
			el: '#fixture',
			data: { message: 'Hello World!' },
			template: '<foo/>'
		});

	}, {
		setup() {
			Ractive.components.foo = Ractive.extend({ template: '<bar/>' });
			Ractive.components.bar = Ractive.extend({ template: '<baz/>' });
			Ractive.components.baz = Ractive.extend({ template: '{{message}}' });
		},
		onCycle(){
			this.ractive.teardown();
		},
		teardown() {
			delete Ractive.components.foo;
			delete Ractive.components.bar;
			delete Ractive.components.baz;
		}
	});

	benchmark('Explicit component mappings', function() {

		this.ractive = new Ractive({
			el: '#fixture',
			data: { message: 'Hello World!' },
			template: '<foo message="{{message}}"/>'
		});

	}, {
		setup() {
			Ractive.components.foo = Ractive.extend({ template: '<bar message="{{message}}"/>' });
			Ractive.components.bar = Ractive.extend({ template: '<baz message="{{message}}"/>' });
			Ractive.components.baz = Ractive.extend({ template: '{{message}}' });
		},
		onCycle(){
			this.ractive.teardown();
		},
		teardown() {
			delete Ractive.components.foo;
			delete Ractive.components.bar;
			delete Ractive.components.baz;
		}
	});

});
