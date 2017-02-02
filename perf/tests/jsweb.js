/* global Ractive */

var tests = [
	{
		name: 'js web framework benchmark approximation',
		test: [
			{
				name: 'init',
				max: 1,
				test() {
					var r = window.ractive = new Ractive({
						el: 'body',
						template:
`<table>
	<tr><th>name</th><th>index</th><th>remove</th></tr>
	{{#if show}}
	{{#rows:i}}
	<tr class="{{#if ~/selected === .id}}selected{{/if}}">
		<td>{{.id}}</td>
		<td>{{.name}}</td>
		<td>{{i}} - {{@index}}</td>
		<td><button on-click="remove:{{i}}">remove</button></td>
	</tr>
	{{/rows}}
	{{/if}}
</table>`,
						data: { rows: [], show: true }
					});
					var id = 0;
					var random = window.random = function random(max) {
						return Math.round(Math.random() * 1000) % max;
					};

					var gen = window.gen = function(count = 1000) {
						var adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
						var colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
						var nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];
						var data = [];
						for (var i = 0; i < count; i++)
							data.push({ id: id++, name: adjectives[random(adjectives.length)] + " " + colours[random(colours.length)] + " " + nouns[random(nouns.length)] });
						return data;
					};

					const style = document.createElement('style');
					style.textContent = 'table tr:nth-child(even) { background-color: green; }';
					document.head.appendChild( style );
				}
			},

			{
				name: 'create 1000 rows',
				max: 1500,
				totalMax: 5000,
				test() {
					ractive.set( 'rows', [] );
					ractive.set( 'rows', gen() );
				}
			},

			{
				name: 'generate 1000 new rows',
				test() {
					/* global ractive, gen */
					ractive.set( 'rows', gen() );
				}
			},

			{
				name: 'add 100 rows (accumulates)',
				test() {
					/* global ractive, gen */
					const rows = gen( 100 );
					rows.unshift( 'rows' );
					ractive.push.apply( ractive, rows );
				}
			},

			{
				name: 'reset to 1000 rows',
				test() {
					/* global ractive, gen */
					ractive.set( 'rows', gen() );
				}
			},

			{
				name: 'remove random row',
				test() {
					/* global ractive, random */
					ractive.splice( 'rows', random( ractive.get( 'rows' ).length - 1 ), 1 );
				},
				maxCount: 100
			},

			{
				name: 'reset to 1000 rows',
				test() {
					/* global ractive, gen */
					ractive.set( 'rows', gen() );
				}
			},

			{
				name: 'remove first row',
				test() {
					/* global ractive */
					ractive.shift( 'rows' );
				},
				maxCount: 100
			},

			{
				name: 'reset to 1000 rows',
				test() {
					/* global ractive, gen */
					ractive.set( 'rows', gen() );
				}
			},

			{
				name: 'remove last row',
				test() {
					/* global ractive */
					ractive.pop( 'rows' );
				},
				maxCount: 100
			},

			{
				name: 'reset to 1000 rows',
				test() {
					/* global ractive, gen */
					ractive.set( 'rows', gen() );
				}
			},

			{
				name: 'hide rows',
				test() {
					/* global ractive */
					ractive.set( 'show', false, { keep: true } );
				},
				maxCount: 1
			},

			{
				name: 'show rows',
				test() {
					/* global ractive */
					ractive.set( 'show', true );
				},
				maxCount: 1
			},

			{
				name: 'hide rows again',
				test() {
					/* global ractive */
					ractive.set( 'show', false, { keep: true } );
				},
				maxCount: 1
			},

			{
				name: 'show rows again',
				test() {
					/* global ractive */
					ractive.set( 'show', true );
				},
				maxCount: 1
			},

			{
				name: 'set hide',
				test() {
					/* global ractive */
					ractive.set( 'tmp', ractive.get( 'rows' ) );
					ractive.set( 'rows', [] );
				},
				maxCount: 1
			},

			{
				name: 'set show',
				test() {
					/* global ractive */
					ractive.set( 'rows', ractive.get( 'tmp' ) );
				},
				maxCount: 1
			},

			{
				name: 'update 100 random rows',
				test() {
					/* global ractive, random */
					let rows = ractive.get( 'rows' );
					for ( let i = 0; i < 100; i++ ) {
						const num = random( rows.length - 1 );
						const row = rows[num];
						ractive.set( `rows.${num}.name`, row.name + '.' );
					}
				}
			},

			{
				name: 'select a random row',
				test() {
					/* global ractive, random */
					const rows = ractive.get( 'rows' );
					const row = rows[ random( rows.length - 1 ) ];
					ractive.set( 'selected', row.id );
				}
			},

			{
				name: 'generate 10,000 rows',
				test() {
					/* global ractive, gen */
					ractive.set( 'rows', gen( 10000 ) );
				}
			},

			{
				name: 'add 1000 more rows to the 10,000 (accumulates)',
				test() {
					/* global ractive, gen */
					const rows = gen();
					rows.unshift( 'rows' );
					ractive.push.apply( ractive, rows );
				}
			},

			{
				name: 'clear all rows',
				test() {
					ractive.set( 'rows', [] );
				},
				maxCount: 1
			}
		]
	}
];
