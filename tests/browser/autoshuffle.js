import { test } from 'qunit';
import { fire } from 'simulant';

import { initModule } from '../helpers/test-config';

export default function() {
  initModule('autoshuffle');

  test(`iterative sections can be told to always automatically shuffle themselves`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items, true shuffle}}<div>{{.}}</div>{{/each}}`,
      data: {
        items: [1, 2, 3, 4, 5]
      }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    r.set('items', [3, 4, 6, 1, 2]);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0', 42);
    t.equal(r.find('div').innerText, '42');
  });

  test(`triple and auto shuffle`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items, true shuffle}}<div>{{{.}}}</div>{{/each}}`,
      data: {
        items: [1, 2, 3, 4, 5]
      }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    r.set('items', [3, 4, 6, 1, 2]);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0', 42);
    t.equal(r.find('div').innerText, '42');
  });

  test(`iterative sections that have a member update when auto shuffling`, t => {
    let items = [
      { v: '1', i: 1 },
      { v: '2', i: 2 },
      { v: '3', i: 3 },
      { v: '4', i: 4 },
      { v: '5', i: 5 }
    ];

    const r = new Ractive({
      target: fixture,
      template: `{{#each items, 'v' shuffle}}<div>{{.i}}</div>{{/each}}`,
      data: { items }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    items[2].i = '42';
    items = [items[2], items[3], { v: '6', i: 6 }, items[0], items[1]];
    r.set('items', items);

    t.equal(r.find('div').innerText, '42');
    r.set('items.0.i', '3');

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });
  });

  test(`attribute bindings work with auto shuffle`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items, true shuffle}}<div data-i="{{@index + 1}}" data-v="{{.}}">{{.}}</div>{{/each}}`,
      data: {
        items: [1, 2, 3, 4, 5]
      }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    r.set('items', [3, 4, 6, 1, 2]);

    r.findAll('div').forEach((e, i) => {
      if (e.innerText !== '6') {
        t.equal(i + 1, e.getAttribute('data-i'), `${e.innerText} data-i`);
        t.equal(e.innerText, e.getAttribute('data-v'), `${e.innerText} data-v`);
        t.equal(e.innerText, e.getAttribute('i'), `${e.innerText} i`);
      } else {
        t.equal(e.getAttribute('data-i'), 3);
        t.equal(6, e.getAttribute('data-v'));
        t.equal(e.getAttribute('i'), null);
      }
    });
  });

  test(`conditional attributes work with auto shuffle`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items, true shuffle}}<div {{#if .}}data-foo="{{\`\${.} \${@index + 1}\`}}"{{/if}}>{{.}}</div>{{/each}}`,
      data: {
        items: [1, 2, 3, 4, 5]
      }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    r.set('items', [3, 4, 6, 1, 2]);

    r.findAll('div').forEach((e, i) => {
      if (e.innerText !== '6') {
        t.equal(e.getAttribute('data-foo'), `${e.innerText} ${i + 1}`);
        t.equal(e.innerText, e.getAttribute('i'));
      } else {
        t.equal(e.getAttribute('data-foo'), '6 3');
        t.equal(e.getAttribute('i'), null);
      }
    });
  });

  test(`binding with auto shuffle`, t => {
    let items = [
      { v: '1', i: 1 },
      { v: '2', i: 2 },
      { v: '3', i: 3 },
      { v: '4', i: 4 },
      { v: '5', i: 5 }
    ];

    const r = new Ractive({
      target: fixture,
      template: `{{#each items, 'i' shuffle}}<input value="{{.v}}" />{{/each}}`,
      data: { items }
    });

    r.findAll('input').forEach((e, i) => e.setAttribute('i', i + 1));

    items = [items[2], items[3], { v: '6', i: 6 }, items[0], items[1]];
    r.set('items', items);

    r.findAll('input').forEach(e => {
      const ctx = r.getContext(e);
      if (ctx.get('i') !== 6) {
        t.equal(e.getAttribute('i'), ctx.get('v'));
      } else {
        t.equal(ctx.get('@index'), 2);
      }
    });

    const input = r.find('input');
    r.set('items.0.v', 42);
    t.equal(input.value, '42');
    t.equal(input.getAttribute('i'), '3');
    input.value = '99';
    fire(input, 'change');
    t.equal(r.get('items.0.v'), '99');
  });

  test(`components and mappings and auto shuffle`, t => {
    const cmp = Ractive.extend({
      template: '<div>{{.foo}}</div>'
    });

    let items = [{ foo: 1 }, { foo: 2 }, { foo: 3 }, { foo: 4 }, { foo: 5 }];

    const r = new Ractive({
      target: fixture,
      template: `{{#each items, 'foo' as shuffle}}<cmp bind-foo />{{/each}}`,
      components: { cmp },
      data: { items }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    items = [items[2], items[3], { foo: '6' }, items[0], items[1]];
    r.set('items', items);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0.foo', 42);
    t.equal(r.find('div').innerText, '42');
  });

  test(`partial with aliases and auto shuffle`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items, true shuffle}}{{>foo . as foo}}{{/each}}`,
      partials: { foo: '<div>{{foo}}</div>' },
      data: {
        items: [1, 2, 3, 4, 5]
      }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));
    r.set('items', [3, 4, 6, 1, 2]);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });
  });

  test(`partial with context and auto shuffle`, t => {
    let items = [
      { foo: { foo: 1 } },
      { foo: { foo: 2 } },
      { foo: { foo: 3 } },
      { foo: { foo: 4 } },
      { foo: { foo: 5 } }
    ];

    const r = new Ractive({
      target: fixture,
      template: `{{#each items, 'foo.foo' shuffle}}{{>foo .foo}}{{/each}}`,
      partials: { foo: '<div>{{.foo}}</div>' },
      data: { items }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    items = [items[2], items[3], { foo: { foo: 6 } }, items[0], items[1]];
    r.set('items', items);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0.foo.foo', 42);
    t.equal(r.find('div').innerText, '42');
  });

  test(`macro and auto shuffle`, t => {
    let items = [{ foo: 1 }, { foo: 2 }, { foo: 3 }, { foo: 4 }, { foo: 5 }];

    const r = new Ractive({
      target: fixture,
      template: `{{#each items, 'foo' shuffle}}<foo bind-foo />{{/each}}`,
      partials: {
        foo: Ractive.macro(
          h => {
            h.aliasLocal('_foo');
            h.set('_foo.v', h.attributes.foo);
            h.setTemplate('<div>{{_foo.v}}</div>');

            return {
              update(attrs) {
                h.set('_foo.v', attrs.foo);
              }
            };
          },
          {
            attributes: ['foo']
          }
        )
      },
      data: { items }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    items = [items[2], items[3], { foo: 6 }, items[0], items[1]];
    r.set('items', items);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0.foo', 42);
    t.equal(r.find('div').innerText, '42');
  });

  test(`conditional section and auto shuffle`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items, true shuffle}}{{#if true}}<div>{{.}}</div>{{/if}}{{/each}}`,
      data: {
        items: [1, 2, 3, 4, 5]
      }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    r.set('items', [3, 4, 6, 1, 2]);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0', 42);
    t.equal(r.find('div').innerText, '42');
  });

  test(`with section and auto shuffle`, t => {
    let items = [
      { foo: { foo: 1 } },
      { foo: { foo: 2 } },
      { foo: { foo: 3 } },
      { foo: { foo: 4 } },
      { foo: { foo: 5 } }
    ];

    const r = new Ractive({
      target: fixture,
      template: `{{#each items, 'foo.foo' shuffle}}{{#with foo}}<div>{{.foo}}</div>{{/with}}{{/each}}`,
      data: { items }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    items = [items[2], items[3], { foo: { foo: 6 } }, items[0], items[1]];
    r.set('items', items);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0.foo.foo', 42);
    t.equal(r.find('div').innerText, '42');
  });

  test(`alias section and auto shuffle`, t => {
    let items = [
      { foo: { foo: 1 } },
      { foo: { foo: 2 } },
      { foo: { foo: 3 } },
      { foo: { foo: 4 } },
      { foo: { foo: 5 } }
    ];

    const r = new Ractive({
      target: fixture,
      template: `{{#each items, 'foo.foo' shuffle}}{{#with .foo.foo as bar}}<div>{{bar}}</div>{{/with}}{{/each}}`,
      data: { items }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    items = [items[2], items[3], { foo: { foo: 6 } }, items[0], items[1]];
    r.set('items', items);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0.foo.foo', 42);
    t.equal(r.find('div').innerText, '42');
  });

  test(`iterative section and auto shuffle`, t => {
    let items = [
      { foo: { foo: [1] } },
      { foo: { foo: [2] } },
      { foo: { foo: [3] } },
      { foo: { foo: [4] } },
      { foo: { foo: [5] } }
    ];

    const r = new Ractive({
      target: fixture,
      template: `{{#each items, 'foo.foo.0' shuffle}}{{#each .foo.foo}}<div>{{.}}</div>{{/each}}{{/each}}`,
      data: { items }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    items = [items[2], items[3], { foo: { foo: [6] } }, items[0], items[1]];
    r.set('items', items);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0.foo.foo', [42]);
    t.equal(r.find('div').innerText, '42');
  });

  test(`expression and auto shuffle`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items, true shuffle}}<div>{{. + 1}}</div>{{/each}}`,
      data: {
        items: [1, 2, 3, 4, 5]
      }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 2));

    r.set('items', [3, 4, 6, 1, 2]);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '7') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0', 42);
    t.equal(r.find('div').innerText, '43');
  });

  test(`expression alias and auto shuffle`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items, true shuffle}}{{#with . + 1 as foo}}<div>{{foo}}</div>{{/with}}{{/each}}`,
      data: {
        items: [1, 2, 3, 4, 5]
      }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 2));

    r.set('items', [3, 4, 6, 1, 2]);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '7') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0', 42);
    t.equal(r.find('div').innerText, '43');
  });

  test(`reference expression and auto shuffle`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items, true shuffle}}<div>{{~/items[@index]}}</div>{{/each}}`,
      data: {
        items: [1, 2, 3, 4, 5]
      }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    r.set('items', [3, 4, 6, 1, 2]);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0', 42);
    t.equal(r.find('div').innerText, '42');
  });

  test(`reference expression alias and auto shuffle`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items, true shuffle}}{{#with ~/items[@index] as foo}}<div>{{foo}}</div>{{/with}}{{/each}}`,
      data: {
        items: [1, 2, 3, 4, 5]
      }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    r.set('items', [3, 4, 6, 1, 2]);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0', 42);
    t.equal(r.find('div').innerText, '42');
  });

  test(`decorator and auto shuffle`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items, true shuffle}}<div as-test="." />{{/each}}`,
      decorators: {
        test(node, v) {
          node.innerText = v;
          return {
            teardown() {},
            update(v) {
              node.innerText = v;
            }
          };
        }
      },
      data: {
        items: [1, 2, 3, 4, 5]
      }
    });

    r.findAll('div').forEach((e, i) => e.setAttribute('i', i + 1));

    r.set('items', [3, 4, 6, 1, 2]);

    r.findAll('div').forEach(e => {
      if (e.innerText !== '6') t.equal(e.innerText, e.getAttribute('i'));
      else t.equal(e.getAttribute('i'), null);
    });

    r.set('items.0', 42);
    t.equal(r.find('div').innerText, '42');
  });

  test(`autoshuffling multiple items at once`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items, true shuffle}}{{.}}{{/each}}`,
      data: {
        items: [1, 2, 3, 4, 5]
      }
    });

    t.htmlEqual(fixture.innerHTML, '12345');

    r.set('items', [3, 1, 2, 4, 5]);
    t.htmlEqual(fixture.innerHTML, '31245');

    r.set('items', [4, 3, 1, 2, 5]);
    t.htmlEqual(fixture.innerHTML, '43125');

    r.set('items', [1, 2, 3, 4, 5]);
    t.htmlEqual(fixture.innerHTML, '12345');

    r.set('items', [4, 5, 1, 2, 3]);
    t.htmlEqual(fixture.innerHTML, '45123');
  });

  test(`autoshuffling multiple items at once at random`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items, true shuffle}}{{.}}{{/each}}`
    });

    const sets = [
      [3, 2, 1, 0, 4, 6, 8, 5],
      [0, 1, 4, 5, 2, 7, 6, 3],
      [0, 1, 2, 3, 4, 5, 7],
      [0, 1, 2, 3, 5, 6, 4],
      [0, 1, 2, 3, 5, 4, 8, 6],
      [4, 1, 0, 2, 3, 5, 6, 8, 7],
      [0, 4, 2, 5, 1, 3, 6, 7, 9],
      [6, 2, 5, 1, 0],
      [1, 3, 0, 4, 5, 6],
      [0, 1, 4, 2, 6, 5, 7, 8, 3]
    ];

    for (let i = 0; i < sets.length; i++) {
      r.set('items', sets[i]);
      t.htmlEqual(fixture.innerHTML, sets[i].join(''));
    }
  });
}
