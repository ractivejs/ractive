import { initModule } from "../helpers/test-config";
import { test } from "qunit";

export default function() {
  initModule("use.js");

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
      t.ok("tmp" in instance.decorators);
      proto.foo = 42;
    });

    const r = new cmp();
    r.use(({ Ractive, proto, instance }) => {
      t.ok(Ractive === Ractive);
      t.ok(proto === r);
      t.ok(instance === r);
      t.ok("tmp" in instance.decorators);
      t.equal(r.foo, 42);
      proto.foo = 99;
      t.equal(cmp.prototype.foo, 42);
    });
  });

  test(`use extend option applies to component`, t => {
    t.expect(3);

    function plug({ proto }) {
      t.ok("plugin called");
      proto.foo = 1;
    }

    const cmp = Ractive.extend({
      use: [plug]
    });

    t.equal(new cmp().foo, 1);

    const r = new Ractive({
      template: "<cmp />",
      target: fixture,
      components: { cmp }
    });

    t.equal(r.findComponent("cmp").foo, 1);
  });

  test(`use instance option applies to instance`, t => {
    let count = 0;
    function plug({ instance }) {
      instance.foo = count++;
    }

    t.equal(new Ractive({ use: [plug] }).foo, 0);
    t.equal(new Ractive({ use: [plug] }).foo, 1);
  });
}
