/* global Ractive */

var tests = [
	{
		name: 'js web framework benchmark approximation',
		test: [
			{
				name: 'create 1000 rows',
				max: 1500,
				totalMax: 5000,
				test() {
					var r = window.ractive = new Ractive({
						el: 'body',
						template:
`<table>
	<tr><th>name</th><th>index</th><th>remove</th></tr>
	{{#rows:i}}
	<tr class="{{#selected === .id}}selected{{/}}">
		<td>{{.id}}</td>
		<td>{{.name}}</td>
		<td>{{i}} - {{@index}}</td>
		<td><button on-click="remove:{{i}}">remove</button></td>
	</tr>
	{{/rows}}
</table>`,
						data: { rows: [] }
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

					r.set( 'rows', gen() );
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
				name: 'add 100 rows',
				test() {
					/* global ractive, gen */
					ractive.push( 'rows', gen( 100 ) );
				},
				maxCount: 5
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
				name: 'remove first row',
				test() {
					/* global ractive */
					ractive.shift( 'rows' );
				},
				maxCount: 100
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
			}
		]
	}
];

if ( tests ) ; // shut up, linter
