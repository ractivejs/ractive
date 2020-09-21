import { test } from 'qunit';

import { initModule } from '../helpers/test-config';

export default function () {
  initModule('use.js');

  test(`Ractive.use gets access to appropriate args`, t => {
    Ractive.use(({ Ractive, proto, instance }) => {
      t.ok(Ractive === Ractive);
      t.ok(proto === Ractive.defaults);
      t.ok(instance === Ractive);
    });
  });

  test(`ractive.use gets access to appropriate args`, t => {
    const r = new Ractive();
    r.use(({ Ractive, proto, instance }) => {
      t.ok(Ractive === Ractive);
      t.ok(proto === r);
      t.ok(instance === r);
    });
  });

  test(`Component.use gets access to appropriate args`, t => {
    const cmp = Ractive.extend({
      decorators: { tmp() {} }
    });

    cmp.use(({ Ractive, proto, instance }) => {
      t.ok(Ractive === Ractive);
      t.ok(proto === cmp.prototype);
      t.ok(instance === cmp);
      t.ok('tmp' in instance.decorators);
      proto.foo = 42;
    });

    const r = new cmp();
    r.use(({ Ractive, proto, instance }) => {
      t.ok(Ractive === Ractive);
      t.ok(proto === r);
      t.ok(instance === r);
      t.ok('tmp' in instance.decorators);
      t.equal(r.foo, 42);
      proto.foo = 99;
      t.equal(cmp.prototype.foo, 42);
    });
  });

  test(`use extend option applies to component`, t => {
    t.expect(3);

    function plug({ proto }) {
      t.ok('plugin called');
      proto.foo = 1;
    }

    const cmp = Ractive.extend({
      use: [plug]
    });

    t.equal(new cmp().foo, 1);

    const r = new Ractive({
      template: '<cmp />',
      target: fixture,
      components: { cmp }
    });

    t.equal(r.findComponent('cmp').foo, 1);
  });

  test(`use instance option applies to instance`, t => {
    let count = 0;
    function plug({ instance }) {
      instance.foo = count++;
    }

    t.equal(new Ractive({ use: [plug] }).foo, 0);
    t.equal(new Ractive({ use: [plug] }).foo, 1);
  });

  test(`use plugins can request to be run at construct for instances`, t => {
    t.expect(4);

    let hitEarly = false;
    let hitLate = false;

    function early() {
      t.ok(!hitLate && !hitEarly);
      hitEarly = true;
    }
    early.construct = true;

    function late() {
      t.ok(!hitLate && hitEarly);
      hitLate = true;
    }

    new Ractive({
      target: fixture,
      template: '',
      use: [late, early],
      on: {
        construct() {
          t.ok(hitEarly && !hitLate);
        },
        render() {
          t.ok(hitEarly && hitLate);
        }
      }
    });
  });

  test(`use plugin can adjust component styles at extension time`, t => {
    function go({ instance }) {
      const css = instance.css;
      instance.css = function (data) {
        return typeof css === 'function' ? css(data) : (css || '') + '.foo { width: 10px; }';
      };
    }

    const cmp = Ractive.extend({
      css: '.foo { height: 25px; }'
    });

    cmp.use(go);

    new cmp({
      target: fixture,
      template: '<div class-foo />'
    });

    t.equal(fixture.firstChild.clientWidth, 10);
    t.equal(fixture.firstChild.clientHeight, 25);
  });

  test(`instance plugins are installed before fragment creation`, t => {
    new Ractive({
      target: fixture,
      template: '{{>test}}',
      use: [
        function ({ instance }) {
          instance.partials.test = ['yep'];
        }
      ]
    });

    t.htmlEqual(fixture.innerHTML, 'yep');
  });
}
