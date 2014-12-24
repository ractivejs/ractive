/*global Ractive */
var tests = [
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
		},
		beforeEach: () => {
			window.ractive = new Ractive({
				el: 'body',
				template: `
					{{#each Array(50) }}
						<foo/>
					{{/each}}`
			});
		},
		test: () => {
			window.ractive.set( 'message', 'hello' );
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
					{{#each Array(50) }}
						<foo/>
					{{/each}}`
			});

			return ractive;
		},
		beforeEach: () => {
			window.ractive = new Ractive({
				el: 'body',
				template: `
					{{#each Array(50) }}
						<foo/>
					{{/each}}`
			});
		},
		test: () => {
			window.ractive.set( 'message', 'hello' );
		}
	},

	{
		name: 'boxes',
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

			window.count = 0;
		},
		test: () => {
			var i, box;

			window.count += 1;

			i = window.boxes.length;
			while ( i-- ) {
				box = window.boxes[i];

				box.top = Math.sin(window.count / 10) * 10;
				box.left = Math.cos(window.count / 10) * 10;
				box.color = (window.count) % 255;
				box.content = window.count % 100;
			}

			window.ractive.update( 'boxes' );
		}
	}
];
