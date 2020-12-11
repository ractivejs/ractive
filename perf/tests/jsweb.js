/* global gen, random, ractive */
const tests = [
  {
    name: 'js web framework benchmark approximation',
    test: [
      {
        name: 'parse',
        maxCount: 10,
        test() {
          window.tpl = Ractive.parse(
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
						</table>`
          );
        }
      },
      {
        name: 'init',
        maxCount: 1,
        test() {
          const r = (window.ractive = new Ractive({
            el: 'body',
            template: window.tpl,
            data: { rows: [], show: true }
          }));
          let id = 0;
          const random = (window.random = function random(max) {
            return Math.round(Math.random() * 1000) % max;
          });

          const gen = (window.gen = function (count = 1000) {
            const adjectives = [
              'pretty',
              'large',
              'big',
              'small',
              'tall',
              'short',
              'long',
              'handsome',
              'plain',
              'quaint',
              'clean',
              'elegant',
              'easy',
              'angry',
              'crazy',
              'helpful',
              'mushy',
              'odd',
              'unsightly',
              'adorable',
              'important',
              'inexpensive',
              'cheap',
              'expensive',
              'fancy'
            ];
            const colours = [
              'red',
              'yellow',
              'blue',
              'green',
              'pink',
              'brown',
              'purple',
              'brown',
              'white',
              'black',
              'orange'
            ];
            const nouns = [
              'table',
              'chair',
              'house',
              'bbq',
              'desk',
              'car',
              'pony',
              'cookie',
              'sandwich',
              'burger',
              'pizza',
              'mouse',
              'keyboard'
            ];
            const data = [];
            for (let i = 0; i < count; i++)
              data.push({
                id: id++,
                name:
                  adjectives[random(adjectives.length)] +
                  ' ' +
                  colours[random(colours.length)] +
                  ' ' +
                  nouns[random(nouns.length)]
              });
            return data;
          });

          const style = document.createElement('style');
          style.textContent = 'table tr:nth-child(even) { background-color: green; }';
          document.head.appendChild(style);
        }
      },

      {
        name: 'create 1000 rows',
        max: 1500,
        totalMax: 5000,
        beforeEach() {
          ractive.set('rows', []);
        },
        test() {
          ractive.set('rows', gen());
        }
      },

      {
        name: 'generate 1000 new rows',
        test() {
          ractive.set('rows', gen());
        }
      },

      {
        name: 'add 100 rows (accumulates)',
        test() {
          const rows = gen(100);
          rows.unshift('rows');
          ractive.push.apply(ractive, rows);
        }
      },

      {
        name: 'remove random row',
        setup() {
          ractive.set('rows', gen());
        },
        test() {
          ractive.splice('rows', random(ractive.get('rows').length - 1), 1);
        },
        maxCount: 100
      },

      {
        name: 'remove first row',
        beforeEach() {
          ractive.set('rows', gen());
        },
        test() {
          ractive.shift('rows');
        },
        maxCount: 100
      },

      {
        name: 'remove last row',
        beforeEach() {
          ractive.set('rows', gen());
        },
        test() {
          ractive.pop('rows');
        },
        maxCount: 100
      },

      {
        name: 'hide rows',
        setup() {
          ractive.set('rows', gen());
        },
        test() {
          ractive.set('show', false);
        },
        maxCount: 1
      },

      {
        name: 'show rows',
        test() {
          ractive.set('show', true);
        },
        maxCount: 1
      },

      {
        name: 'hide rows again',
        test() {
          ractive.set('show', false);
        },
        maxCount: 1
      },

      {
        name: 'show rows again',
        test() {
          ractive.set('show', true);
        },
        maxCount: 1
      },

      {
        name: 'update 100 random rows',
        test() {
          const rows = ractive.get('rows');
          for (let i = 0; i < 100; i++) {
            const num = random(rows.length - 1);
            const row = rows[num];
            ractive.set(`rows.${num}.name`, row.name + '.');
          }
        }
      },

      {
        name: 'select a random row',
        test() {
          const rows = ractive.get('rows');
          const row = rows[random(rows.length - 1)];
          ractive.set('selected', row.id);
        }
      },

      {
        name: 'generate 10,000 rows',
        beforeEach() {
          ractive.set('rows', []);
        },
        test() {
          ractive.set('rows', gen(10000));
        },
        totalMax: 10000,
        max: 5000
      },

      {
        name: 'add 1000 more rows to the 10,000 (accumulates)',
        test() {
          const rows = gen();
          rows.unshift('rows');
          ractive.push.apply(ractive, rows);
        }
      },

      {
        name: 'clear all rows',
        test() {
          ractive.set('rows', []);
        },
        maxCount: 1
      }
    ]
  }
];
