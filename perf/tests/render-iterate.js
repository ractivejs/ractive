/*global Ractive */

var setup = function(){
	window.messages = new Array( 100 );
	window.hash = {};

	for (var i = 0; i < messages.length; i++) {
		hash['message' + i] = messages[i] = {
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
		name: 'hash iteration',
		setup: setup,
		test: () => {
			window.ractive = new Ractive({
				el: 'body',
				template: `
					<ul>
					{{#each messages: title }}
						<li>{{title}}: {{this.message}}</li>
					{{/each}}
					<ul>`,
				data: {
					messages: window.hash
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
					{{#partial message}}
						<li>{{message}}{{number}}</li>
					{{/partial}}
					<ul>
					{{#each messages }}
						{{>message}}
					{{/each}}
					<ul>`,
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
