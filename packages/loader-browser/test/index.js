import { module, test } from 'qunit'
import { loadComponent, loadComponents } from '@ractivejs/loader-browser'

module('loader-browser')

test('single', assert => {
  return loadComponent('/base/test/samples/single/', 'component.ractive.html', { answer: 42 }).then(Component => {
    assert.strictEqual(typeof Component, 'function')
    assert.strictEqual(typeof Component.extend, 'function')
    assert.deepEqual(Component.defaults.data, { message: 'World', answer: 42 })
    assert.deepEqual(Component.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'f': ['Hello, ', { 't': 2, 'r': 'message' }, '!'] }, ' ', { 't': 7, 'e': 'div', 'f': ['Answer to the Ultimate Question of Life, the Universe, and Everything: ', { 't': 2, 'r': 'answer' }] }, ' ', { 't': 7, 'e': 'MyComponent' }, ' ', { 't': 7, 'e': 'MyOtherComponent' }, ' ', { 't': 7, 'e': 'YetAnotherComponent' }] })

    assert.ok(Component.components.hasOwnProperty('MyComponent'))
    assert.strictEqual(typeof Component.components.MyComponent, 'function')
    assert.strictEqual(typeof Component.components.MyComponent.extend, 'function')
    assert.deepEqual(Component.components.MyComponent.defaults.data, {})
    assert.deepEqual(Component.components.MyComponent.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'my-component', 't': 13 }], 'f': ['My Component'] }] })

    assert.ok(Component.components.hasOwnProperty('MyOtherComponent'))
    assert.strictEqual(typeof Component.components.MyOtherComponent, 'function')
    assert.strictEqual(typeof Component.components.MyOtherComponent.extend, 'function')
    assert.deepEqual(Component.components.MyOtherComponent.defaults.data, {})
    assert.deepEqual(Component.components.MyOtherComponent.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'my-other-component', 't': 13 }], 'f': ['My Other Component'] }] })

    assert.ok(Component.components.hasOwnProperty('YetAnotherComponent'))
    assert.strictEqual(typeof Component.components.YetAnotherComponent, 'function')
    assert.strictEqual(typeof Component.components.YetAnotherComponent.extend, 'function')
    assert.deepEqual(Component.components.YetAnotherComponent.defaults.data, {})
    assert.deepEqual(Component.components.YetAnotherComponent.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'yet-another-component', 't': 13 }], 'f': ['Yet Another Component'] }] })

    const instance = Component({ el: '#qunit-fixture' })
    const cssId = Component.defaults.cssId
    const html = `<div data-ractive-css='{${cssId}}'>Hello, World!</div> <div data-ractive-css='{${cssId}}'>Answer to the Ultimate Question of Life, the Universe, and Everything: 42</div> <div data-ractive-css='{${cssId}}' class='my-component'>My Component</div> <div data-ractive-css='{${cssId}}' class='my-other-component'>My Other Component</div> <div data-ractive-css='{${cssId}}' class='yet-another-component'>Yet Another Component</div>`

    assert.htmlEqual(instance.toHTML(), html)
    assert.htmlEqual(document.getElementById('qunit-fixture').innerHTML, html)
  })
})

test('multiple', assert => {
  return loadComponents('/base/test/samples/multiple/', ['component1.ractive.html', 'component2.ractive.html'], { answer: 42, shared: {} }).then(components => {
    assert.strictEqual(typeof components[0], 'function')
    assert.strictEqual(typeof components[0].extend, 'function')
    assert.deepEqual(components[0].defaults.data, { message: 'World', answer: 42, shared: {} })
    assert.deepEqual(components[0].defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'component-1', 't': 13 }], 'f': [{ 't': 7, 'e': 'div', 'f': ['Hello, ', { 't': 2, 'r': 'message' }, '!'] }, ' ', { 't': 7, 'e': 'div', 'f': ['Answer to the Ultimate Question of Life, the Universe, and Everything: ', { 't': 2, 'r': 'answer' }] }, ' ', { 't': 7, 'e': 'MyComponent' }, ' ', { 't': 7, 'e': 'MyOtherComponent' }, ' ', { 't': 7, 'e': 'YetAnotherComponent' }] }] })

    assert.strictEqual(typeof components[1], 'function')
    assert.strictEqual(typeof components[1].extend, 'function')
    assert.deepEqual(components[1].defaults.data, { message: 'World', answer: 42, shared: {} })
    assert.deepEqual(components[1].defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'component-2', 't': 13 }], 'f': [{ 't': 7, 'e': 'div', 'f': ['Hello, ', { 't': 2, 'r': 'message' }, '!'] }, ' ', { 't': 7, 'e': 'div', 'f': ['Answer to the Ultimate Question of Life, the Universe, and Everything: ', { 't': 2, 'r': 'answer' }] }, ' ', { 't': 7, 'e': 'MyComponent' }, ' ', { 't': 7, 'e': 'MyOtherComponent' }, ' ', { 't': 7, 'e': 'YetAnotherComponent' }] }] })

    components.forEach(Component => {
      assert.ok(Component.components.hasOwnProperty('MyComponent'))
      assert.strictEqual(typeof Component.components.MyComponent, 'function')
      assert.strictEqual(typeof Component.components.MyComponent.extend, 'function')
      assert.deepEqual(Component.components.MyComponent.defaults.data, {})
      assert.deepEqual(Component.components.MyComponent.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'my-component', 't': 13 }], 'f': ['My Component'] }] })

      assert.ok(Component.components.hasOwnProperty('MyOtherComponent'))
      assert.strictEqual(typeof Component.components.MyOtherComponent, 'function')
      assert.strictEqual(typeof Component.components.MyOtherComponent.extend, 'function')
      assert.deepEqual(Component.components.MyOtherComponent.defaults.data, {})
      assert.deepEqual(Component.components.MyOtherComponent.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'my-other-component', 't': 13 }], 'f': ['My Other Component'] }] })

      assert.ok(Component.components.hasOwnProperty('YetAnotherComponent'))
      assert.strictEqual(typeof Component.components.YetAnotherComponent, 'function')
      assert.strictEqual(typeof Component.components.YetAnotherComponent.extend, 'function')
      assert.deepEqual(Component.components.YetAnotherComponent.defaults.data, {})
      assert.deepEqual(Component.components.YetAnotherComponent.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'yet-another-component', 't': 13 }], 'f': ['Yet Another Component'] }] })
    })

    // Ensure the dependencies are only ever evaluated once
    assert.ok(components[0].defaults.data.answer === components[1].defaults.data.answer)
    assert.ok(components[0].defaults.data.shared === components[1].defaults.data.shared)
    assert.ok(components[0].components.MyComponent === components[1].components.MyComponent)
    assert.ok(components[0].components.MyOtherComponent === components[1].components.MyOtherComponent)
    assert.ok(components[0].components.YetAnotherComponent === components[1].components.YetAnotherComponent)
  })
})

// TODO: Test with multi-load
// TODO: Test with imports only
// TODO: Test with template only
// TODO: Test with style only
// TODO: Test with script only
// TODO: Test with dependency-relative links
// TODO: Test with base-relative links
// TODO: Test with absolute links
// TODO: Test with empty top levels
// TODO: Test with duplicate imports
// TODO: Test with duplicate requires
// TODO: Test with block-commented require
// TODO: Test with line-commented-require
