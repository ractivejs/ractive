suite('Set', () => {

	benchmark('Direct keypath', function () {
		this.ractive.set('a', Math.random());
	}, {
		setup() {
			this.ractive = new Ractive({
				el: '#fixture',
				template: '{{a}}'
			});
		},
		teardown() {
			this.ractive.teardown();
		}
	});

	benchmark('Shallow keypath', function () {
		this.ractive.set('a.b', Math.random());
	}, {
		setup() {
			this.ractive = new Ractive({
				el: '#fixture',
				template: '{{a.b}}'
			});
		},
		teardown() {
			this.ractive.teardown();
		}
	});

	benchmark('Deep keypath', function () {
		this.ractive.set('a.b.c.d.e.f.g.h', Math.random());
	}, {
		setup() {
			this.ractive = new Ractive({
				el: '#fixture',
				template: '{{a.b.c.d.e.f.g.h}}'
			});
		},
		teardown() {
			this.ractive.teardown();
		}
	});

	benchmark('Deep keypath with direct observer', function () {
		this.ractive.set('a.b.c.d.e.f.g.h', Math.random());
	}, {
		setup() {
			this.ractive = new Ractive({
				el: '#fixture',
				template: '{{a.b.c.d.e.f.g.h}}'
			});
			this.ractive.observe('a.b.c.d.e.f.g.h', () => {});
		},
		teardown() {
			this.ractive.teardown();
		}
	});

	benchmark('Deep keypath with wildcard observer at the end', function () {
		this.ractive.set('a.b.c.d.e.f.g.h', Math.random());
	}, {
		setup() {
			this.ractive = new Ractive({
				el: '#fixture',
				template: '{{a.b.c.d.e.f.g.h}}'
			});
			this.ractive.observe('a.b.c.d.e.f.g.*', () => {});
		},
		teardown() {
			this.ractive.teardown();
		}
	});

	benchmark('Deep keypath with wildcard observer midway', function () {
		this.ractive.set('a.b.c.d.e.f.g.h', Math.random());
	}, {
		setup() {
			this.ractive = new Ractive({
				el: '#fixture',
				template: '{{a.b.c.d.e.f.g.h}}'
			});
			this.ractive.observe('a.b.c.*.e.f.g.h', () => {});
		},
		teardown() {
			this.ractive.teardown();
		}
	});

	benchmark('Deep keypath with wildcard observer at top level', function () {
		this.ractive.set('a.b.c.d.e.f.g.h', Math.random());
	}, {
		setup() {
			this.ractive = new Ractive({
				el: '#fixture',
				template: '{{a.b.c.d.e.f.g.h}}'
			});
			this.ractive.observe('*.b.c.d.e.f.g.h', () => {});
		},
		teardown() {
			this.ractive.teardown();
		}
	});

	benchmark('Implicit mapping', function () {
		this.ractive.set('a', Math.random());
	}, {
		setup() {
			Ractive.components.foo = Ractive.extend({ template: '<bar/>' });
			Ractive.components.bar = Ractive.extend({ template: '<baz/>' });
			Ractive.components.baz = Ractive.extend({ template: '{{a}}' });

			this.ractive = new Ractive({
				el: '#fixture',
				template: '<foo/>'
			});
		},
		teardown() {
			this.ractive.teardown();
			delete Ractive.components.foo;
			delete Ractive.components.bar;
			delete Ractive.components.baz;
		}
	});

	benchmark('Explicit mapping', function () {
		this.ractive.set('a', Math.random());
	}, {
		setup() {
			Ractive.components.foo = Ractive.extend({ template: '<bar c="{{b}}"/>' });
			Ractive.components.bar = Ractive.extend({ template: '<baz d="{{c}}"/>' });
			Ractive.components.baz = Ractive.extend({ template: '{{d}}' });

			this.ractive = new Ractive({
				el: '#fixture',
				template: '<foo b="{{a}}"/>'
			});
		},
		teardown() {
			this.ractive.teardown();
			delete Ractive.components.foo;
			delete Ractive.components.bar;
			delete Ractive.components.baz;
		}
	});

});
