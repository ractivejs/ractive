/*global Ractive, MouseEvent, console */

var setup = function(){
	var items = new Array( 1000 );

	for (var i = 0, l = items.length; i < l; i++) {
		items[i] = 'hello';
	}
	window.items = items;
};

var tests = [
	{
		name: 'subscribe events',
		setup: setup,
		test: () => {
			window.ractive = new Ractive({
				el: 'body',
				template: `
					<ul>
					{{#each items }}
						<li on-click='foo()'>{{this}} world</li>
					{{/each}}
					<ul>`,
				data: {
					items: window.items
				},
				foo: function () {

				}
			});

			var nodes = window.ractive.findAll( 'li' );

			for( var i = 0, l = nodes.length; i < l; i++ ) {
				nodes[i].dispatchEvent( new MouseEvent('click', {
					'view': window,
					'bubbles': true,
					'cancelable': true
				}));
			}
		}
	}
];
