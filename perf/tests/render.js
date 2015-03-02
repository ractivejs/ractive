/*global Ractive */

var tests = [
	{
		name: 'render implicit mappings',
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

			window.messages = new Array( 50 );
			for (var i = 0; i < messages.length; i++) {
				messages[i] = { message: 'hello ' + i }
			};
		},
		test: () => {
			window.ractive = new Ractive({
				el: 'body',
				template: `
					{{#each messages }}
						<foo/>
					{{/each}}`,
				data: {
					messages: window.messages
				}
			});
		}
	},

	{
		name: 'render explicit mappings',
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

			window.messages = new Array( 50 );
			for (var i = 0; i < messages.length; i++) {
				messages[i] = { message: 'hello ' + i }
			};
		},
		test: () => {
			window.ractive = new Ractive({
				el: 'body',
				template: `
					{{#each messages }}
						<foo message='{{ this }}'/>
					{{/each}}`,
				data: {
					messages: window.messages
				}
			});
		}
	},

	{
		name: 'render boxes',
		setup: () => {
			var i = 100, style;

			style = document.createElement( 'style' );
			style.innerHTML = `
				.box-view {
					width: 20px; height: 20px;
					float: left;
					position: relative;
					margin: 8px;
				}

				.box {
					border-radius: 100px;
					width: 20px; height: 10px;
					padding: 5px 0;
					color: #fff;
					font: 10px/10px Arial;
					text-align: center;
					position: absolute;
				}`;
			document.head.appendChild( style );

			window.boxes = [];
			while ( i-- ) {
				window.boxes[i] = { top: 0, left: 0, color: 0, content: 0 };
			}
		},
		test: () => {

			window.ractive = new Ractive({
				el: 'body',
				template: `
					{{#boxes:i}}
						<div class='box-view'>
							<div class="box" style="top: {{top}}px; left: {{left}}px; background: rgb(0,0,{{color}});">
								{{content}}
							</div>
						</div>
					{{/boxes}}`,
				data: { boxes: window.boxes }
			});

		}
	}
];
