import { test } from 'qunit';
import { initModule, onWarn } from '../helpers/test-config';

export default function() {
  initModule('parser');

  test(`global defaults apply to parsing even with no instance`, t => {
    const delimiters = Ractive.defaults.delimiters;
    Ractive.defaults.delimiters = ['<%', '%>'];
    const parsed = Ractive.parse('<% foo %>');
    t.deepEqual(parsed, { v: 4, t: [{ t: 2, r: 'foo' }] });
    Ractive.defaults.delimiters = delimiters;
  });

  test(`block sections with only a reference warn about non-matching closing tags (#2925)`, t => {
    t.expect(1);

    onWarn(m => t.ok(/expected.*foo.bar.*but found.*foobar/i.test(m)));

    Ractive.parse('{{#foo.bar}}...{{/foobar}}');
    Ractive.parse('{{#foo.bar}}...{{/}}');
    Ractive.parse('{{#[1, 2, 3]}} ... {{/who cares}}');
    Ractive.parse('{{#foo.bar}}...{{/foo.bar}}');
  });

  test(`expressions can be completely disabled by the parser`, t => {
    t.expect(3);

    t.ok(Ractive.parse('{{.foo()}}'));
    t.throws(
      () => Ractive.parse('{{ .foo() }}', { allowExpressions: false }),
      /expected closing delimiter/i
    );
    t.throws(
      () =>
        new Ractive({
          template: '{{.foo()}}',
          allowExpressions: false
        }),
      /expected closing delimiter/i
    );
  });

  test(`expressions on a template provided to an instance with disallowed expressions are not executed`, t => {
    t.expect(1);

    new Ractive({
      target: fixture,
      template: Ractive.parse('{{ foo() }}-{{ foo( 42, "abc" ) }}'),
      data: {
        foo() {
          t.ok(false, 'should not run');
        }
      },
      allowExpressions: false
    });

    t.equal(fixture.innerHTML, '-');
  });

  test(`mixing preserve whitespace per element and interpolation per element`, t => {
    const tpl = '<div>\n\t<f>\n\t\t<tag />\n\t\t{{f}}\n</f>\n</div>';

    t.deepEqual(
      Ractive.parse(tpl, { preserveWhitespace: { f: false }, interpolate: { f: false } }).t,
      [{ t: 7, e: 'div', f: [{ t: 7, e: 'f', f: ['<tag /> {{f}}'] }] }]
    );

    t.deepEqual(
      Ractive.parse(tpl, { preserveWhitespace: { f: true }, interpolate: { f: false } }).t,
      [{ t: 7, e: 'div', f: [{ t: 7, e: 'f', f: ['\t\t<tag />\n\t\t{{f}}'] }] }]
    );

    t.deepEqual(
      Ractive.parse(tpl, { preserveWhitespace: { f: false }, interpolate: { f: true } }).t,
      [{ t: 7, e: 'div', f: [{ t: 7, e: 'f', f: ['<tag /> ', { t: 2, r: 'f' }] }] }]
    );

    t.deepEqual(
      Ractive.parse(tpl, { preserveWhitespace: { f: true }, interpolate: { f: true } }).t,
      [{ t: 7, e: 'div', f: [{ t: 7, e: 'f', f: ['\t\t<tag />\n\t\t', { t: 2, r: 'f' }] }] }]
    );

    t.deepEqual(Ractive.parse(tpl, { interpolate: { f: false } }).t, [
      { t: 7, e: 'div', f: [{ t: 7, e: 'f', f: ['<tag /> {{f}}'] }] }
    ]);

    t.deepEqual(Ractive.parse(tpl, { preserveWhitespace: { f: true } }).t, [
      {
        t: 7,
        e: 'div',
        f: [{ t: 7, e: 'f', f: ['\t\t', { t: 7, e: 'tag' }, '\n\t\t', { t: 2, r: 'f' }] }]
      }
    ]);

    t.deepEqual(Ractive.parse(tpl).t, [
      {
        t: 7,
        e: 'div',
        f: [{ t: 7, e: 'f', f: [{ t: 7, e: 'tag' }, ' ', { t: 2, r: 'f' }] }]
      }
    ]);
  });

  test(`static style attributes don't grow an extra semi (#3257)`, t => {
    const tpl = Ractive.parse('<div style="color: green;" />');
    t.equal(tpl.t[0].m[0].f, 'color: green;');
  });
}
