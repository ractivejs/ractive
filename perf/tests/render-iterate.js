/*global Ractive */

var setup = function(){
	window.messages = new Array( 100 );
	for (var i = 0; i < messages.length; i++) {
		messages[i] = {
			message: 'hello ' + i,
			number: i
		};
	};
};

var tests = [
	{
		name: 'inline iteration',
		setup: setup,
		test: () => {
			window.ractive = new Ractive({
				el: 'body',
				template: `
					<ul>
					{{#each messages }}
						<li>{{message}}{{number}}</li>
					{{/each}}
					<ul>`,
				data: {
					messages: window.messages
				}
			});
		}
	},

	{
		name: 'partial iteration',
		setup: setup,
		test: () => {
			window.ractive = new Ractive({
				el: 'body',
				template: `
					<ul>
					{{#each messages }}
						{{>message}}
					{{/each}}
					<ul>
					{{#partial message}}
						<li>{{message}}{{number}}</li>
					{{/partial}}`,
				data: {
					messages: window.messages
				}
			});
		}
	},

	{
		name: 'implicit component iteration',
		setup: setup,
		test: () => {
			window.ractive = new Ractive({
				el: 'body',
				template: `
					<ul>
					{{#each messages }}
						<message/>
					{{/each}}
					<ul>`,
				components: {
					message: Ractive.extend({
						template: '<li>{{message}}{{number}}</li>'
					})
				},
				data: {
					messages: window.messages
				}
			});
		}
	},

	{
		name: 'explicit component iteration',
		setup: setup,
		test: () => {
			window.ractive = new Ractive({
				el: 'body',
				template: `
					<ul>
					{{#each messages }}
						<message message='{{message}}' number='{{number}}'/>
					{{/each}}
					<ul>`,
				components: {
					message: Ractive.extend({
						template: '<li>{{message}}{{number}}</li>'
					})
				},
				data: {
					messages: window.messages
				}
			});
		}
	}
];
