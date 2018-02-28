import { initModule } from "../../helpers/test-config";
import { test } from "qunit";
import { fire } from "simulant";

export default function() {
  initModule("partials/macros.js");

  test(`basic macro`, t => {
    new Ractive({
      target: fixture,
      template: "<macro />",
      partials: {
        macro: Ractive.macro(handle => handle.setTemplate("a macro"))
      }
    });

    t.htmlEqual(fixture.innerHTML, "a macro");
  });

  test(`macros and sections`, t => {
    const r = new Ractive({
      target: fixture,
      template: `a<macro />b{{#if foo}}c<macro />d{{else}}<macro />e<macro />{{/if}}<macro />{{#each list}}<macro />{{/each}}{{#each list}}g<macro />{{/each}}{{#each list}}<macro />h{{/each}}`,
      data: {
        list: [0],
        foo: true
      },
      partials: {
        macro: Ractive.macro(handle => handle.setTemplate(["z"]))
      }
    });

    t.htmlEqual(fixture.innerHTML, "azbczdzzgzzh");

    r.toggle("foo");

    t.htmlEqual(fixture.innerHTML, "azbzezzzgzzh");
  });

  test(`macro claimed attributes`, t => {
    const r = new Ractive({
      target: fixture,
      template: '<macro name="joe" value="{{foo}}" />',
      partials: {
        macro: Ractive.macro(
          (handle, attrs) => {
            t.equal(Object.keys(attrs).length, 1);
            t.equal(attrs.name, "joe");
            t.equal(handle.template.m.length, 1);
            t.equal(handle.template.m[0].n, "value");

            handle.setTemplate([{ t: 7, e: "input", m: handle.template.m }]);
          },
          {
            attributes: ["name"]
          }
        )
      }
    });

    t.htmlEqual(fixture.innerHTML, "<input />");

    const input = r.find("input");
    input.value = "larry";
    fire(input, "change");

    t.equal(r.get("foo"), "larry");
  });

  test(`updating claimed macro attributes`, t => {
    const obj = { hello: "world" };

    const r = new Ractive({
      target: fixture,
      template: `<macro name="{{foo}}" value="{{bar}}" disabled />`,
      data: {
        foo: 10,
        bar: obj
      },
      partials: {
        macro: Ractive.macro(
          (handle, attrs) => {
            t.equal(Object.keys(attrs).length, 2);
            t.strictEqual(attrs.name, 10);
            t.strictEqual(attrs.value, obj);

            handle.setTemplate([{ t: 7, e: "button", m: handle.template.m }]);
            return {
              update(attrs) {
                t.equal(JSON.stringify(attrs.name), JSON.stringify(["test"]));
                t.strictEqual(attrs.value, "42");
              }
            };
          },
          {
            attributes: ["name", "value"]
          }
        )
      }
    });

    t.htmlEqual(fixture.innerHTML, "<button disabled></button>");

    r.set({
      foo: ["test"],
      bar: "42"
    });
  });

  test(`multiple updates to climed macro attributes`, t => {
    const r = new Ractive({
      target: fixture,
      template: `<macro bind-name />`,
      data: { name: "joe" },
      partials: {
        macro: Ractive.macro(
          (handle, attrs) => {
            handle.setTemplate([attrs.name]);
            return {
              update(attrs) {
                handle.setTemplate([attrs.name]);
              }
            };
          },
          { attributes: ["name"] }
        )
      }
    });

    t.htmlEqual(fixture.innerHTML, "joe");

    r.set("name", "larry");

    t.htmlEqual(fixture.innerHTML, "larry");

    r.set("name", "rich");

    t.htmlEqual(fixture.innerHTML, "rich");
  });

  test(`shuffling claimed macro attributes`, t => {
    t.expect(0);

    const r = new Ractive({
      target: fixture,
      template: `{{#each list}}<macro bind-val=. />{{/each}}`,
      data: {
        list: [0]
      },
      partials: {
        macro: Ractive.macro(
          () => {
            return {
              update() {
                t.ok(false, "should not update on shuffle");
              }
            };
          },
          {
            attributes: ["val"]
          }
        )
      }
    });

    r.unshift("list", 1);
  });

  test(`macro content partial`, t => {
    new Ractive({
      target: fixture,
      template: "<macro>macro1</macro><macro>nope{{#partial content}}macro2{{/partial}}</macro>",
      partials: {
        macro: Ractive.macro(handle => handle.setTemplate("{{>content}}"))
      }
    });

    t.htmlEqual(fixture.innerHTML, "macro1macro2");
  });

  test(`macro unclaimed attributes partial`, t => {
    new Ractive({
      target: fixture,
      template: `<macro1 class="foo" name="bar" /><macro2 class="joe" on-click="bar" />`,
      partials: {
        macro1: Ractive.macro(
          handle => {
            t.equal(handle.template.m.length, 1);
            handle.setTemplate("<div {{>extra-attributes}} />");
          },
          { attributes: ["name"] }
        ),
        macro2: Ractive.macro(handle => {
          t.equal(handle.template.m.length, 2);
          handle.setTemplate("<span {{>extra-attributes}} />");
        })
      }
    });

    t.htmlEqual(fixture.innerHTML, '<div class="foo"></div><span class="joe"></span>');
  });

  test(`optional macro invalidate callback`, t => {
    t.expect(1);

    const r = new Ractive({
      target: fixture,
      template: `{{#if bar}}...{{/if}}<macro>{{#if foo}}...{{/if}}</macro>`,
      data: {
        foo: true,
        bar: true
      },
      partials: {
        macro: Ractive.macro(handle => {
          handle.setTemplate("{{>content}}");

          return {
            invalidate() {
              t.ok(true);
            }
          };
        })
      }
    });

    r.toggle("foo");
    r.toggle("bar");
  });

  test(`macro out of band setTemplate`, t => {
    let handle;

    new Ractive({
      target: fixture,
      template: "<macro />",
      partials: {
        macro: Ractive.macro(h => {
          handle = h;
        })
      }
    });

    const script = document.createElement("script");
    script.setAttribute("type", "text/html");
    script.setAttribute("id", "macro-template");
    script.textContent = "hello";
    document.body.appendChild(script);

    t.htmlEqual(fixture.innerHTML, "");

    handle.setTemplate("#macro-template");
    t.htmlEqual(fixture.innerHTML, "hello");

    handle.setTemplate("testing");
    t.htmlEqual(fixture.innerHTML, "testing");

    handle.setTemplate({ template: "partial style obj" });
    t.htmlEqual(fixture.innerHTML, "partial style obj");

    handle.setTemplate({ t: ["other partial"] });
    t.htmlEqual(fixture.innerHTML, "other partial");

    handle.setTemplate(["direct template"]);
    t.htmlEqual(fixture.innerHTML, "direct template");

    document.body.removeChild(script);
  });

  test(`macro progressive enhancement`, t => {
    fixture.innerHTML = `<div class="foo">hello</div>`;
    const div = fixture.childNodes[0];

    new Ractive({
      target: fixture,
      enhance: true,
      template: "<macro />",
      partials: {
        macro: Ractive.macro(handle => handle.setTemplate('<div class="foo">hello</div>'))
      }
    });

    t.ok(fixture.childNodes.length === 1);
    t.ok(fixture.childNodes[0] === div);
  });

  test(`macro kept set`, t => {
    const r = new Ractive({
      target: fixture,
      template: "{{#if foo}}<macro />{{/if}}",
      data: {
        foo: true
      },
      partials: {
        macro: Ractive.macro(handle => handle.setTemplate('<div class="foo">hello</div>'))
      }
    });

    const div = fixture.childNodes[0];

    r.toggle("foo", { keep: true });
    r.toggle("foo");

    t.ok(fixture.childNodes.length === 1);
    t.ok(fixture.childNodes[0] === div);
  });

  test(`macro in component`, t => {
    new Ractive({
      target: fixture,
      template: "<div /><cmp />",
      components: {
        cmp: Ractive.extend({
          template: "<div />",
          partials: {
            div: Ractive.macro(handle => handle.setTemplate("<span />"))
          }
        })
      }
    });

    t.htmlEqual(fixture.innerHTML, "<div></div><span></span>");
  });

  test(`macro init, render, and teardown callback`, t => {
    let up = 0;
    let render = 0;
    let down = 0;

    const r = new Ractive({
      target: fixture,
      template: `{{#if foo}}<macro />{{/if}}`,
      partials: {
        macro: Ractive.macro(
          () =>
            ++up && {
              teardown() {
                down++;
              },
              render() {
                render++;
              }
            }
        )
      }
    });

    r.toggle("foo");

    t.equal(up, 1);
    t.equal(render, 1);
    t.equal(down, 0);

    r.toggle("foo");

    t.equal(up, 1);
    t.equal(render, 1);
    t.equal(down, 1);

    r.toggle("foo");

    t.equal(up, 2);
    t.equal(render, 2);
    t.equal(down, 1);

    r.toggle("foo");

    t.equal(up, 2);
    t.equal(render, 2);
    t.equal(down, 2);
  });

  test(`macro css`, t => {
    const r = new Ractive({
      target: fixture,
      template: `<macro />`,
      partials: {
        macro: Ractive.macro(handle => handle.setTemplate("<div />"), {
          css: "div { width: 123px; }"
        })
      }
    });

    t.equal(r.find("div").clientWidth, 123);
  });

  test(`macro css no transform`, t => {
    const r = new Ractive({
      target: fixture,
      template: `<div class="macro-css-no-transforms" /><macro />`,
      partials: {
        macro: Ractive.macro(handle => handle.setTemplate(["yep"]), {
          css: ".macro-css-no-transforms { width: 123px; }",
          noCssTransform: true
        })
      }
    });

    t.equal(r.find("div").clientWidth, 123);
  });

  test(`macro css fn`, t => {
    const macro = Ractive.macro(handle => handle.setTemplate("<div />"), {
      css(data) {
        return `div { width: ${data("width")}; }`;
      }
    });

    macro.styleSet("width", "123px");

    const r = new Ractive({
      target: fixture,
      template: `<macro />`,
      partials: {
        macro
      }
    });

    t.equal(r.find("div").clientWidth, 123);

    macro.styleSet("width", "124px");

    t.equal(r.find("div").clientWidth, 124);
  });

  test(`macro styleGet`, t => {
    const macro = Ractive.macro(handle => handle.setTemplate([]));

    Ractive.styleSet("foo", 99);
    t.equal(macro.styleGet("foo"), 99);

    Ractive.styleSet("foo", "abc");
    t.equal(macro.styleGet("foo"), "abc");
  });

  test(`plain partial syntax can resolve to a macro`, t => {
    new Ractive({
      target: fixture,
      template: "{{>macro}}",
      partials: {
        macro: Ractive.macro(handle => handle.setTemplate("a macro"))
      }
    });

    t.htmlEqual(fixture.innerHTML, "a macro");
  });

  test(`dynamic partial may become a macro and return to plain`, t => {
    let down = 0;
    let render = 0;

    const r = new Ractive({
      target: fixture,
      template: "{{>macro}}",
      partials: {
        foo: "foo",
        bar: Ractive.macro(handle => {
          handle.setTemplate(["bar"]);
          return {
            teardown() {
              down++;
            },
            render() {
              render++;
            }
          };
        })
      },
      data: {
        macro: "foo"
      }
    });

    t.htmlEqual(fixture.innerHTML, "foo");

    r.set("macro", "bar");
    t.equal(render, 1);
    t.htmlEqual(fixture.innerHTML, "bar");

    r.set("macro", "foo");
    t.equal(down, 1);
    t.equal(render, 1);
    t.htmlEqual(fixture.innerHTML, "foo");
  });

  test(`dynamic macro partial may become plain and return to macro`, t => {
    const r = new Ractive({
      target: fixture,
      template: "{{>macro}}",
      partials: {
        foo: "foo",
        bar: Ractive.macro(handle => handle.setTemplate(["bar"]))
      },
      data: {
        macro: "bar"
      }
    });

    t.htmlEqual(fixture.innerHTML, "bar");

    r.set("macro", "foo");
    t.htmlEqual(fixture.innerHTML, "foo");

    r.set("macro", "bar");
    t.htmlEqual(fixture.innerHTML, "bar");
  });

  test(`macro partial with context`, t => {
    new Ractive({
      target: fixture,
      template: "{{>macro .foo}}",
      partials: {
        macro: Ractive.macro(handle => handle.setTemplate("{{.bar}}"))
      },
      data: {
        bar: "nope",
        foo: { bar: "yep" }
      }
    });

    t.htmlEqual(fixture.innerHTML, "yep");
  });

  test(`macro partial with aliases`, t => {
    new Ractive({
      target: fixture,
      template: "{{>macro .foo as it}}",
      partials: {
        macro: Ractive.macro(handle => handle.setTemplate("{{it.bar}}"))
      },
      data: {
        foo: { bar: "yep" }
      }
    });

    t.htmlEqual(fixture.innerHTML, "yep");
  });

  test(`dynamic plain partial with macro in data`, t => {
    const r = new Ractive({
      target: fixture,
      template: "{{>macro}}"
    });

    r.set("macro", Ractive.macro(handle => handle.setTemplate(["hello"])));

    t.htmlEqual(fixture.innerHTML, "hello");
  });

  test(`macro template change during attr update`, t => {
    const r = new Ractive({
      target: fixture,
      template: `<macro foo="{{bar}}" />`,
      data: {
        bar: 42
      },
      partials: {
        macro: Ractive.macro(
          handle => {
            return {
              update(attrs) {
                handle.setTemplate(["" + attrs.foo]);
              }
            };
          },
          {
            attributes: ["foo"]
          }
        )
      }
    });

    t.htmlEqual(fixture.innerHTML, "");

    r.set("bar", 99);
    t.htmlEqual(fixture.innerHTML, "99");
  });

  test(`macros must be functions`, t => {
    t.throws(() => {
      Ractive.macro({ attributes: [] });
    }, /macro must be a function/);
  });

  test(`macros can set up an alias for @local`, t => {
    let handle;

    const r = new Ractive({
      target: fixture,
      template: "{{@local.foo}}<thing bind-name />",
      data: {
        name: "foo"
      },
      partials: {
        thing: Ractive.macro(
          h => {
            handle = h;

            h.aliasLocal("__thing");
            h.set("@local.foo", "bar");
            h.setTemplate("{{__thing.foo}}");

            return {
              update(attrs) {
                h.aliasLocal(attrs.name);
                h.set("@local.foo", "baz");
                h.setTemplate(`{{${attrs.name}.foo}}`);
              }
            };
          },
          {
            attributes: ["name"]
          }
        )
      }
    });

    t.htmlEqual(fixture.innerHTML, "bar");

    r.set("name", "joe");
    t.htmlEqual(fixture.innerHTML, "baz");

    handle.set("joe.foo", "yep");
    t.htmlEqual(fixture.innerHTML, "yep");
  });

  test(`partial dirty template flag doesn't get stuck`, t => {
    let h;

    const macro = Ractive.macro(
      handle => {
        h = handle;
      },
      {
        attributes: ["foo"]
      }
    );

    const r = new Ractive({
      target: fixture,
      template: "<macro bind-foo>{{foo}}</macro>",
      partials: { macro },
      data: {
        foo: "hello"
      }
    });

    h.setTemplate("<p>{{>content}}</p>");

    const p = r.find("p");

    r.set("foo", "bar");
    t.ok(p === r.find("p"), "template not reset");
  });
}
