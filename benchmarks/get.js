suite('Get', () => {

	benchmark('Shallow keypath', function () {
		this.ractive.get('a');
	}, {
		setup() {
			this.ractive = new Ractive({
				data: { a: Date.now() }
			});
		},
		onCycle() {
			this.ractive.set('a.b.c.d.e.f.g.h', Date.now());
		},
		teardown() {
			this.ractive.teardown();
		}
	});

	benchmark('Deep keypath', function () {
		this.ractive.get('a.b.c.d.e.f.g.h');
	}, {
		setup() {
			this.ractive = new Ractive({
				data: { a: { b: { c: { d: { e: { f: { g: { h: Date.now() } } } } } } } }
			});
		},
		onCycle() {
			this.ractive.set('a.b.c.d.e.f.g.h', Date.now());
		},
		teardown() {
			this.ractive.teardown();
		}
	});

});
