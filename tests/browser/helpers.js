import { initModule } from "../helpers/test-config";
import { test } from "qunit";

export default function() {
  initModule("helpers.js");

  test(`helpers are available for use in templates`, t => {
    new Ractive({
      target: fixture,
      template: "{{upper(foo)}}",
      data: { foo: "bar" },
      helpers: {
        upper(v) {
          return v.toUpperCase();
        }
      }
    });

    t.htmlEqual(fixture.innerHTML, "BAR");
  });

  test(`helpers are inherited`, t => {
    const cmp1 = Ractive.extend({
      helpers: {
        upper(v) {
          return v.toUpperCase();
        }
      }
    });

    const cmp2 = cmp1.extend({
      helpers: {}
    });

    new cmp2({
      target: fixture,
      template: "{{upper(foo)}}",
      data: { foo: "bar" },
      helpers: {}
    });

    t.htmlEqual(fixture.innerHTML, "BAR");
  });

  test(`helpers can be overridden down the inheritance line`, t => {
    const cmp = Ractive.extend({
      helpers: {
        fmt(v) {
          return v.toUpperCase();
        }
      }
    });

    new cmp({
      target: fixture,
      template: "{{fmt(foo)}}",
      data: { foo: "bar" },
      helpers: {
        fmt(v) {
          return v.split("").join(" ");
        }
      }
    });

    t.htmlEqual(fixture.innerHTML, "b a r");
  });

  test(`helpers can be accessed via @helpers for api retrieval and update`, t => {
    const cmp = Ractive.extend({
      helpers: {
        fmt1(v) {
          return v.toUpperCase();
        }
      }
    });
    const r = new cmp({
      target: fixture,
      template: `{{fmt1(foo) + ' ' + fmt2(foo)}}`,
      data: { foo: "bar" },
      helpers: {
        fmt2(v) {
          return v.split("").join(" ");
        }
      }
    });

    t.equal(r.get("@helpers.fmt1")("asdf"), "ASDF");
    t.htmlEqual(fixture.innerHTML, "BAR b a r");

    cmp.prototype.helpers.fmt1 = function(v) {
      return v
        .split("")
        .join(" ")
        .toUpperCase();
    };
    r.update("@helpers.fmt1");
    t.htmlEqual(fixture.innerHTML, "B A R b a r");

    r.set("@helpers.fmt1", v => "_" + v);
    t.htmlEqual(fixture.innerHTML, "_bar b a r");
  });
}
