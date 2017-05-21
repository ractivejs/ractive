suite('Events', () => {

	benchmark('DOM events', function () {
		this.link.dispatchEvent(new MouseEvent('click', {
			view: window,
			bubbles: true,
			cancelable: true
		}));
	}, {
		setup() {
			this.ractive = new Ractive({
				el: '#fixture',
				template: '<a href="#" on-click="foo()">Click Me!</a>'
			});
			this.link = this.ractive.find('a');
		},
		teardown() {
			this.ractive.teardown();
		}
	});

});
