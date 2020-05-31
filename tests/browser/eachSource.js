import { test } from 'qunit';
import { fire } from 'simulant';

import { initModule } from '../helpers/test-config';

export default function() {
  initModule('eachSource');

  test(`each can be told to map each iteration back to a source array for computed values`, t => {
    const r = new Ractive({
      target: fixture,
      template:
        '{{#each items.slice(start, end) as item, items as source}}{{item}}-{{@keypath}}-{{@index}}|{{/each}}',
      data: {
        items: [1, 2, 3, 4],
        start: 0,
        end: 2
      }
    });

    t.htmlEqual(fixture.innerHTML, '1-items.0-0|2-items.1-1|');

    r.set({ start: 2, end: 4 });

    t.htmlEqual(fixture.innerHTML, '3-items.2-0|4-items.3-1|');
  });

  test(`each on a non-computed value ignores the source`, t => {
    const r = new Ractive({
      target: fixture,
      template: '{{#each items as item, items as source}}{{.}}-{{@keypath}}-{{@index}}|{{/each}}',
      data: {
        items: [1, 2, 3, 4]
      }
    });

    t.equal(r.fragment.items[0].fragment.context.getKeypath(), 'items');
    t.ok(!r.fragment.items[0].fragment.source);
  });

  test(`each with source and nested conditional`, t => {
    const r = new Ractive({
      target: fixture,
      template:
        '{{#each items.slice(start, end) as item, items as source}}{{#if item == ~/offset + @index}}{{item}}-{{@keypath}}-{{@index}}|{{/if}}{{/each}}',
      data: {
        items: [1, 2, 3, 4],
        start: 0,
        end: 2,
        offset: 1
      }
    });

    t.htmlEqual(fixture.innerHTML, '1-items.0-0|2-items.1-1|');

    r.set({ start: 2, end: 4, offset: 3 });

    t.htmlEqual(fixture.innerHTML, '3-items.2-0|4-items.3-1|');
  });

  test(`each with source and nested bindings`, t => {
    const r = new Ractive({
      target: fixture,
      template: `{{#each items.slice(start, end), items source}}<input value="{{.v}}" />{{/each}}`,
      data: {
        items: [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }],
        start: 0,
        end: 2
      }
    });

    let inputs = r.findAll('input');

    t.equal(inputs[0].value, '1');
    t.equal(inputs[1].value, '2');

    inputs[0].value = 42;
    inputs[1].value = 43;

    fire(inputs[0], 'input');
    fire(inputs[1], 'input');

    t.equal(r.get('items.0.v'), '42');
    t.equal(r.get('items.1.v'), '43');

    r.set({ start: 2, end: 4 });

    inputs = r.findAll('input');

    t.equal(inputs[0].value, '3');
    t.equal(inputs[1].value, '4');

    inputs[0].value = 98;
    inputs[1].value = 99;

    fire(inputs[0], 'input');
    fire(inputs[1], 'input');

    t.equal(r.get('items.2.v'), '98');
    t.equal(r.get('items.3.v'), '99');

    r.set({ start: 0, end: 2 });

    inputs = r.findAll('input');

    t.equal(inputs[0].value, '42');
    t.equal(inputs[1].value, '43');
  });

  test(`each with source that is shuffled`, t => {
    const r = new Ractive({
      target: fixture,
      template:
        '{{#each items.slice(start, end), items source}}{{#each .v as item}}{{item}}-{{@keypath}}-{{@index}}|{{/each}}{{/each}}',
      data: {
        items: [{ v: [1, 2] }, { v: [3, 4] }],
        start: 0,
        end: 1
      }
    });

    t.htmlEqual(fixture.innerHTML, '1-items.0.v.0-0|2-items.0.v.1-1|');

    r.set({ start: 1, end: 2 });

    t.htmlEqual(fixture.innerHTML, '3-items.1.v.0-0|4-items.1.v.1-1|');

    r.unshift('items', { v: [] });

    t.htmlEqual(fixture.innerHTML, '1-items.1.v.0-0|2-items.1.v.1-1|');

    r.unshift('items.1.v', 99);

    t.htmlEqual(fixture.innerHTML, '99-items.1.v.0-0|1-items.1.v.1-1|2-items.1.v.2-2|');
  });

  test(`source mapped each and attributes`, t => {
    const r = new Ractive({
      target: fixture,
      template:
        '{{#each items.slice(start, end), items source}}<div class="{{.}}">{{@keypath}}-{{@index}}</div>{{/each}}',
      data: {
        items: ['a', 'b', 'c', 'd'],
        start: 0,
        end: 2
      }
    });

    t.htmlEqual(fixture.innerHTML, '<div class="a">items.0-0</div><div class="b">items.1-1</div>');

    r.set({ start: 1, end: 3 });

    t.htmlEqual(fixture.innerHTML, '<div class="b">items.1-0</div><div class="c">items.2-1</div>');

    r.set('items.2', 'yep');

    t.htmlEqual(
      fixture.innerHTML,
      '<div class="b">items.1-0</div><div class="yep">items.2-1</div>'
    );

    r.set({ start: 2, end: 4 });

    t.htmlEqual(
      fixture.innerHTML,
      '<div class="yep">items.2-0</div><div class="d">items.3-1</div>'
    );
  });

  test(`source mapped each and conditional attributes`, t => {
    const r = new Ractive({
      target: fixture,
      template:
        '{{#each items.slice(start, end), items source}}<div {{`class="${.}"`}}>{{@keypath}}-{{@index}}</div>{{/each}}',
      data: {
        items: ['a', 'b', 'c', 'd'],
        start: 0,
        end: 2
      }
    });

    t.htmlEqual(fixture.innerHTML, '<div class="a">items.0-0</div><div class="b">items.1-1</div>');

    r.set({ start: 1, end: 3 });

    t.htmlEqual(fixture.innerHTML, '<div class="b">items.1-0</div><div class="c">items.2-1</div>');

    r.set('items.2', 'yep');

    t.htmlEqual(
      fixture.innerHTML,
      '<div class="b">items.1-0</div><div class="yep">items.2-1</div>'
    );

    r.set({ start: 2, end: 4 });

    t.htmlEqual(
      fixture.innerHTML,
      '<div class="yep">items.2-0</div><div class="d">items.3-1</div>'
    );
  });

  test(`source mapped each and component mapping`, t => {
    const cmp = Ractive.extend({
      template: '<div>{{foo}}-{{@keypath}}-{{@rootpath}}-{{yield}}</div>'
    });

    const r = new Ractive({
      target: fixture,
      template:
        '{{#each items.slice(start, end), items source}}<cmp bind-foo=.>{{@keypath}}-{{@index}}</cmp>{{/each}}',
      components: { cmp },
      data: {
        items: ['a', 'b', 'c', 'd'],
        start: 0,
        end: 2
      }
    });

    t.htmlEqual(
      fixture.innerHTML,
      '<div>a--items.0-items.0-0</div><div>b--items.1-items.1-1</div>'
    );

    r.set({ start: 1, end: 3 });

    t.htmlEqual(
      fixture.innerHTML,
      '<div>b--items.1-items.1-0</div><div>c--items.2-items.2-1</div>'
    );

    r.set('items.2', 'yep');

    t.htmlEqual(
      fixture.innerHTML,
      '<div>b--items.1-items.1-0</div><div>yep--items.2-items.2-1</div>'
    );

    r.set({ start: 2, end: 4 });

    t.htmlEqual(
      fixture.innerHTML,
      '<div>yep--items.2-items.2-0</div><div>d--items.3-items.3-1</div>'
    );
  });

  test(`source mapped each and partial`, t => {
    const r = new Ractive({
      target: fixture,
      template: '{{#each items.slice(start, end), items source}}{{>foo}}{{/each}}',
      data: {
        items: ['a', 'b', 'c', 'd'],
        start: 0,
        end: 2
      },
      partials: {
        foo: '<div>{{.}}-{{@keypath}}-{{@index}}</div>'
      }
    });

    t.htmlEqual(fixture.innerHTML, '<div>a-items.0-0</div><div>b-items.1-1</div>');

    r.set({ start: 1, end: 3 });

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1-0</div><div>c-items.2-1</div>');

    r.set('items.2', 'yep');

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1-0</div><div>yep-items.2-1</div>');

    r.set({ start: 2, end: 4 });

    t.htmlEqual(fixture.innerHTML, '<div>yep-items.2-0</div><div>d-items.3-1</div>');
  });

  test(`source mapped each and partial with context`, t => {
    const r = new Ractive({
      target: fixture,
      template: '{{#each items.slice(start, end), items source}}{{>foo .v}}{{/each}}',
      data: {
        items: [{ v: 'a' }, { v: 'b' }, { v: 'c' }, { v: 'd' }],
        start: 0,
        end: 2
      },
      partials: {
        foo: '<div>{{.}}-{{@keypath}}-{{@index}}</div>'
      }
    });

    t.htmlEqual(fixture.innerHTML, '<div>a-items.0.v-0</div><div>b-items.1.v-1</div>');

    r.set({ start: 1, end: 3 });

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1.v-0</div><div>c-items.2.v-1</div>');

    r.set('items.2.v', 'yep');

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1.v-0</div><div>yep-items.2.v-1</div>');

    r.set({ start: 2, end: 4 });

    t.htmlEqual(fixture.innerHTML, '<div>yep-items.2.v-0</div><div>d-items.3.v-1</div>');
  });

  test(`source mapped each and partial with alias`, t => {
    const r = new Ractive({
      target: fixture,
      template: '{{#each items.slice(start, end), items source}}{{>foo . as foo}}{{/each}}',
      data: {
        items: ['a', 'b', 'c', 'd'],
        start: 0,
        end: 2
      },
      partials: {
        foo: '<div>{{foo}}-{{@keypath}}-{{@index}}</div>'
      }
    });

    t.htmlEqual(fixture.innerHTML, '<div>a-items.0-0</div><div>b-items.1-1</div>');

    r.set({ start: 1, end: 3 });

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1-0</div><div>c-items.2-1</div>');

    r.set('items.2', 'yep');

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1-0</div><div>yep-items.2-1</div>');

    r.set({ start: 2, end: 4 });

    t.htmlEqual(fixture.innerHTML, '<div>yep-items.2-0</div><div>d-items.3-1</div>');
  });

  test(`source mapped each and macro`, t => {
    const r = new Ractive({
      target: fixture,
      template:
        '{{#each items.slice(start, end), items source}}<foo bind-a>{{.v}}-{{@keypath}}-{{@index}}</foo>{{/each}}',
      data: {
        items: [
          { a: 'a', v: 1 },
          { a: 'b', v: 2 },
          { a: 'c', v: 3 },
          { a: 'd', v: 4 }
        ],
        start: 0,
        end: 2
      },
      partials: {
        foo: Ractive.macro(
          h => {
            h.aliasLocal('_foo');
            h.setTemplate('<div class="{{_foo.attr}}">{{>content}}</div>');
            h.set('@local.attr', h.attributes.a);
            return {
              update(attrs) {
                h.set('@local.attr', attrs.a);
              }
            };
          },
          {
            attributes: ['a']
          }
        )
      }
    });

    t.htmlEqual(
      fixture.innerHTML,
      '<div class="a">1-items.0-0</div><div class="b">2-items.1-1</div>'
    );

    r.set({ start: 1, end: 3 });

    t.htmlEqual(
      fixture.innerHTML,
      '<div class="b">2-items.1-0</div><div class="c">3-items.2-1</div>'
    );

    r.set('items.2.a', 'yep');

    t.htmlEqual(
      fixture.innerHTML,
      '<div class="b">2-items.1-0</div><div class="yep">3-items.2-1</div>'
    );

    r.set({ start: 2, end: 4 });

    t.htmlEqual(
      fixture.innerHTML,
      '<div class="yep">3-items.2-0</div><div class="d">4-items.3-1</div>'
    );
  });

  test(`source mapped each and with`, t => {
    const r = new Ractive({
      target: fixture,
      template:
        '{{#each items.slice(start, end), items source}}{{#with .v}}<div>{{.}}-{{@keypath}}-{{@index}}</div>{{/with}}{{/each}}',
      data: {
        items: [{ v: 'a' }, { v: 'b' }, { v: 'c' }, { v: 'd' }],
        start: 0,
        end: 2
      }
    });

    t.htmlEqual(fixture.innerHTML, '<div>a-items.0.v-0</div><div>b-items.1.v-1</div>');

    r.set({ start: 1, end: 3 });

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1.v-0</div><div>c-items.2.v-1</div>');

    r.set('items.2.v', 'yep');

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1.v-0</div><div>yep-items.2.v-1</div>');

    r.set({ start: 2, end: 4 });

    t.htmlEqual(fixture.innerHTML, '<div>yep-items.2.v-0</div><div>d-items.3.v-1</div>');
  });

  test(`source mapped each and alias block`, t => {
    const r = new Ractive({
      target: fixture,
      template:
        '{{#each items.slice(start, end), items source}}{{#with . as foo}}<div>{{foo}}-{{@keypath}}-{{@index}}</div>{{/with}}{{/each}}',
      data: {
        items: ['a', 'b', 'c', 'd'],
        start: 0,
        end: 2
      }
    });

    t.htmlEqual(fixture.innerHTML, '<div>a-items.0-0</div><div>b-items.1-1</div>');

    r.set({ start: 1, end: 3 });

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1-0</div><div>c-items.2-1</div>');

    r.set('items.2', 'yep');

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1-0</div><div>yep-items.2-1</div>');

    r.set({ start: 2, end: 4 });

    t.htmlEqual(fixture.innerHTML, '<div>yep-items.2-0</div><div>d-items.3-1</div>');
  });

  test(`source mapped each and alias block`, t => {
    const r = new Ractive({
      target: fixture,
      template:
        '{{#each items.slice(start, end), items source}}{{#if .length && typeof . === "string"}}<div>{{.}}-{{@keypath}}-{{@index}}</div>{{/if}}{{/each}}',
      data: {
        items: ['a', 'b', 'c', 'd'],
        start: 0,
        end: 2
      }
    });

    t.htmlEqual(fixture.innerHTML, '<div>a-items.0-0</div><div>b-items.1-1</div>');

    r.set({ start: 1, end: 3 });

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1-0</div><div>c-items.2-1</div>');

    r.set('items.2', false);

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1-0</div>');

    r.set({ start: 2, end: 4 });

    t.htmlEqual(fixture.innerHTML, '<div>d-items.3-1</div>');
  });

  test(`source mapped each and partial with context`, t => {
    const r = new Ractive({
      target: fixture,
      template:
        '{{#each items.slice(start, end), items source}}<div>{{.[~/key]}}-{{@keypath}}-{{@index}}</div>{{/each}}',
      data: {
        items: [{ v: 'a' }, { v: 'b' }, { v: 'c' }, { v: 'd' }],
        key: 'v',
        start: 0,
        end: 2
      }
    });

    t.htmlEqual(fixture.innerHTML, '<div>a-items.0-0</div><div>b-items.1-1</div>');

    r.set({ start: 1, end: 3 });

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1-0</div><div>c-items.2-1</div>');

    r.set('items.2.v', 'yep');

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1-0</div><div>yep-items.2-1</div>');

    r.set({ start: 2, end: 4 });

    t.htmlEqual(fixture.innerHTML, '<div>yep-items.2-0</div><div>d-items.3-1</div>');
  });

  test(`source mapped each and decorator`, t => {
    const r = new Ractive({
      target: fixture,
      template: '{{#each items.slice(start, end), items source}}<div as-foo=. />{{/each}}',
      data: {
        items: ['a', 'b', 'c', 'd'],
        start: 0,
        end: 2
      },
      decorators: {
        foo(node, val) {
          const ctx = this.getContext(node);
          node.innerHTML = `${val}-${ctx.get('@keypath')}-${ctx.get('@index')}`;
          return {
            teardown() {},
            update(val) {
              node.innerHTML = `${val}-${ctx.get('@keypath')}-${ctx.get('@index')}`;
            }
          };
        }
      }
    });

    t.htmlEqual(fixture.innerHTML, '<div>a-items.0-0</div><div>b-items.1-1</div>');

    r.set({ start: 1, end: 3 });

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1-0</div><div>c-items.2-1</div>');

    r.set('items.2', 'yep');

    t.htmlEqual(fixture.innerHTML, '<div>b-items.1-0</div><div>yep-items.2-1</div>');

    r.set({ start: 2, end: 4 });

    t.htmlEqual(fixture.innerHTML, '<div>yep-items.2-0</div><div>d-items.3-1</div>');
  });

  test(`source mapped each with contexty yields`, t => {
    const cmp = Ractive.extend({
      template:
        '<p>{{#each computed, thingies as source}}<span>{{yield part with .foo}}</span>{{/each}}</p>',
      computed: {
        computed() {
          const offset = this.get('offset');
          return this.get('thingies').slice(offset, offset + 1);
        }
      }
    });
    const r = new Ractive({
      target: fixture,
      template:
        '<div><cmp bind-thingies=items bind-offset>{{#partial part}}{{.}} {{@keypath}}{{/partial}}</cmp></div>',
      data: {
        items: [{ foo: 1 }, { foo: 2 }, { foo: 3 }],
        offset: 0
      },
      components: { cmp }
    });

    t.htmlEqual(fixture.innerHTML, '<div><p><span>1 thingies.0.foo</span></p></div>');

    r.add('offset');

    t.htmlEqual(fixture.innerHTML, '<div><p><span>2 thingies.1.foo</span></p></div>');
  });
  // reference expression, decorator
}
