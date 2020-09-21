import { test } from 'qunit';

import { initModule } from '../../helpers/test-config';

export default function () {
  initModule('components/async.js');

  test(`loading a components from a promise`, t => {
    const done = t.async();

    const cmp = Promise.resolve(Ractive.extend({ template: 'hello' }));
    new Ractive({
      target: fixture,
      template: '<cmp />',
      components: { cmp }
    });

    t.equal(fixture.innerHTML, '');

    setTimeout(() => {
      t.equal(fixture.innerHTML, 'hello');
      done();
    });
  });

  test(`loading a component from a promise with an async-loading placeholder`, t => {
    const done = t.async();

    const cmp = Promise.resolve(Ractive.extend({ template: 'hello' }));
    new Ractive({
      target: fixture,
      template: '<cmp>{{#partial async-loading}}loading...{{/partial}}</cmp>',
      components: { cmp }
    });

    t.equal(fixture.innerHTML, 'loading...');

    setTimeout(() => {
      t.equal(fixture.innerHTML, 'hello');
      done();
    });
  });

  test(`component function returning a promise`, t => {
    const done = t.async();

    const cmp = Promise.resolve(Ractive.extend({ template: 'hello' }));
    new Ractive({
      target: fixture,
      template: '<cmp />',
      components: { cmp: () => cmp }
    });

    t.equal(fixture.innerHTML, '');

    setTimeout(() => {
      t.equal(fixture.innerHTML, 'hello');
      done();
    });
  });

  test(`component function returning a promise and an async loading placeholder`, t => {
    const done = t.async();

    const cmp = Promise.resolve(Ractive.extend({ template: 'hello' }));
    new Ractive({
      target: fixture,
      template: '<cmp>{{#partial async-loading}}loading...{{/partial}}</cmp>',
      components: { cmp: () => cmp }
    });

    t.equal(fixture.innerHTML, 'loading...');

    setTimeout(() => {
      t.equal(fixture.innerHTML, 'hello');
      done();
    });
  });

  test(`async component with an async-loaded component wrapper`, t => {
    const done = t.async();

    const cmp = Promise.resolve(Ractive.extend({ template: 'hello' }));
    new Ractive({
      target: fixture,
      template: `<cmp>{{#partial async-loading}}loading...{{/partial}}{{#partial async-loaded}}<div class="loaded">{{>component}}</div>{{/partial}}</cmp>`,
      components: { cmp }
    });

    t.equal(fixture.innerHTML, 'loading...');

    setTimeout(() => {
      t.equal(fixture.innerHTML, '<div class="loaded">hello</div>');
      done();
    });
  });

  test(`failed async component doesn't leave the placeholder in place`, t => {
    const done = t.async();

    const cmp = Promise.reject(new Error('lolwut'));
    new Ractive({
      target: fixture,
      template: `<cmp>{{#partial async-loading}}loading...{{/partial}}</cmp>`,
      components: { cmp }
    });

    t.equal(fixture.innerHTML, 'loading...');

    setTimeout(() => {
      t.equal(fixture.innerHTML, '');
      done();
    });
  });

  test(`failed async component can supply a partial to handle display an error`, t => {
    const done = t.async();

    const cmp = Promise.reject(new Error('lolwut'));
    new Ractive({
      target: fixture,
      template: `<cmp>{{#partial async-loading}}loading...{{/partial}}{{#partial async-failed}}no, because {{error.message}}{{/partial}}</cmp>`,
      components: { cmp }
    });

    t.equal(fixture.innerHTML, 'loading...');

    setTimeout(() => {
      t.equal(fixture.innerHTML, 'no, because lolwut');
      done();
    });
  });

  test(`async component is loaded in correct dom order`, t => {
    const done = t.async();

    const cmp = Promise.resolve(Ractive.extend({ template: '<h2>cmp</h2>' }));
    new Ractive({
      target: fixture,
      template:
        '<h1>first</h1><cmp>{{#partial async-loading}}<p>loading...</p>{{/partial}}</cmp><h3>last</h3>',
      components: { cmp }
    });

    t.equal(fixture.innerHTML, '<h1>first</h1><p>loading...</p><h3>last</h3>');

    setTimeout(() => {
      t.htmlEqual(fixture.innerHTML, '<h1>first</h1><h2>cmp</h2><h3>last</h3>');
      done();
    });
  });
}
