import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
  initModule('methods/getLocalContext.js');

  test('decorators get access to local context', t => {
    t.expect(2);
    const cmp = Ractive.extend({
      template: `{{#with foo.bar}}<div {{yield attrs}}></div>{{/with}}`,
      data() {
        return { foo: { bar: {} } };
      }
    });

    new Ractive({
      template: `{{#with baz.bat}}<cmp bind-attrs />{{/with}}`,
      decorators: {
        foo() {
          const ctx = this.getLocalContext();
          t.ok(ctx);
          t.equal(ctx.resolve(), 'baz.bat');
          return { teardown() {} };
        }
      },
      data: {
        attrs: { t: [{ t: 71, n: 'foo' }] },
        baz: { bat: {} }
      },
      components: { cmp },
      target: fixture
    });
  });

  test('custom events get access to local context', t => {
    t.expect(2);

    const custom = function() {
      const ctx = this.getLocalContext();

      t.ok(ctx);
      t.equal(ctx.resolve(), 'baz.bat');

      return {
        teardown() {}
      };
    };

    const cmp = Ractive.extend({
      template: `{{#with foo.bar}}<div {{yield attrs}}></div>{{/with}}`,
      data() {
        return { foo: { bar: {} } };
      }
    });

    new Ractive({
      template: `{{#with baz.bat}}<cmp bind-attrs />{{/with}}`,
      events: { custom },
      data: {
        attrs: { t: [{ t: 70, n: ['custom'], f: 'sure' }] },
        baz: { bat: {} }
      },
      components: { cmp },
      target: fixture
    });
  });
}
