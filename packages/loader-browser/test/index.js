import { module, test } from 'qunit'
import { loadComponent, loadComponents } from '@ractivejs/loader-browser'

module('loader-browser')

test('relative to component', assert => {
  return loadComponent('/base/test/samples/relative-component/', 'component.ractive.html', { answer: 42 }).then(Component => {
    assert.strictEqual(typeof Component, 'function')
    assert.strictEqual(typeof Component.extend, 'function')
    assert.deepEqual(Component.defaults.data, { message: 'World', answer: 42 })
    assert.deepEqual(Component.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'f': ['Hello, ', { 't': 2, 'r': 'message' }, '!'] }, ' ', { 't': 7, 'e': 'div', 'f': ['Answer to the Ultimate Question of Life, the Universe, and Everything: ', { 't': 2, 'r': 'answer' }] }, ' ', { 't': 7, 'e': 'MyComponent' }] })

    assert.ok(Component.components.hasOwnProperty('MyComponent'))
    assert.strictEqual(typeof Component.components.MyComponent, 'function')
    assert.strictEqual(typeof Component.components.MyComponent.extend, 'function')
    assert.deepEqual(Component.components.MyComponent.defaults.data, {})
    assert.deepEqual(Component.components.MyComponent.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'my-component', 't': 13 }], 'f': ['My Component'] }] })

    const instance = Component({ el: '#qunit-fixture' })
    const cssId = Component.defaults.cssId
    const html = `<div data-ractive-css='{${cssId}}'>Hello, World!</div> <div data-ractive-css='{${cssId}}'>Answer to the Ultimate Question of Life, the Universe, and Everything: 42</div> <div data-ractive-css='{${cssId}}' class='my-component'>My Component</div>`

    assert.htmlEqual(instance.toHTML(), html)
    assert.htmlEqual(document.getElementById('qunit-fixture').innerHTML, html)
  })
})

test('relative to base', assert => {
  return loadComponent('/base/test/samples/relative-base/', 'path/to/component.ractive.html', { answer: 42 }).then(Component => {
    assert.strictEqual(typeof Component, 'function')
    assert.strictEqual(typeof Component.extend, 'function')
    assert.deepEqual(Component.defaults.data, { message: 'World', answer: 42 })
    assert.deepEqual(Component.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'f': ['Hello, ', { 't': 2, 'r': 'message' }, '!'] }, ' ', { 't': 7, 'e': 'div', 'f': ['Answer to the Ultimate Question of Life, the Universe, and Everything: ', { 't': 2, 'r': 'answer' }] }, ' ', { 't': 7, 'e': 'MyComponent' }] })

    assert.ok(Component.components.hasOwnProperty('MyComponent'))
    assert.strictEqual(typeof Component.components.MyComponent, 'function')
    assert.strictEqual(typeof Component.components.MyComponent.extend, 'function')
    assert.deepEqual(Component.components.MyComponent.defaults.data, {})
    assert.deepEqual(Component.components.MyComponent.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'my-component', 't': 13 }], 'f': ['My Component'] }] })

    const instance = Component({ el: '#qunit-fixture' })
    const cssId = Component.defaults.cssId
    const html = `<div data-ractive-css='{${cssId}}'>Hello, World!</div> <div data-ractive-css='{${cssId}}'>Answer to the Ultimate Question of Life, the Universe, and Everything: 42</div> <div data-ractive-css='{${cssId}}' class='my-component'>My Component</div>`

    assert.htmlEqual(instance.toHTML(), html)
    assert.htmlEqual(document.getElementById('qunit-fixture').innerHTML, html)
  })
})

test('relative to domain', assert => {
  return loadComponent('/foo/bar/baz/qux/', '/base/test/samples/relative-domain/path/to/component.ractive.html', { answer: 42 }).then(Component => {
    assert.strictEqual(typeof Component, 'function')
    assert.strictEqual(typeof Component.extend, 'function')
    assert.deepEqual(Component.defaults.data, { message: 'World', answer: 42 })
    assert.deepEqual(Component.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'f': ['Hello, ', { 't': 2, 'r': 'message' }, '!'] }, ' ', { 't': 7, 'e': 'div', 'f': ['Answer to the Ultimate Question of Life, the Universe, and Everything: ', { 't': 2, 'r': 'answer' }] }, ' ', { 't': 7, 'e': 'MyComponent' }] })

    assert.ok(Component.components.hasOwnProperty('MyComponent'))
    assert.strictEqual(typeof Component.components.MyComponent, 'function')
    assert.strictEqual(typeof Component.components.MyComponent.extend, 'function')
    assert.deepEqual(Component.components.MyComponent.defaults.data, {})
    assert.deepEqual(Component.components.MyComponent.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'my-component', 't': 13 }], 'f': ['My Component'] }] })

    const instance = Component({ el: '#qunit-fixture' })
    const cssId = Component.defaults.cssId
    const html = `<div data-ractive-css='{${cssId}}'>Hello, World!</div> <div data-ractive-css='{${cssId}}'>Answer to the Ultimate Question of Life, the Universe, and Everything: 42</div> <div data-ractive-css='{${cssId}}' class='my-component'>My Component</div>`

    assert.htmlEqual(instance.toHTML(), html)
    assert.htmlEqual(document.getElementById('qunit-fixture').innerHTML, html)
  })
})

test('multi-link', assert => {
  return loadComponent('/base/test/samples/multi-link/', 'component.ractive.html', { answer: 42 }).then(Component => {
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

test('multi-load', assert => {
  return loadComponents('/base/test/samples/multi-load/', ['component1.ractive.html', 'component2.ractive.html'], { answer: 42, shared: {} }).then(components => {
    components.forEach(Component => {
      assert.strictEqual(typeof Component, 'function')
      assert.strictEqual(typeof Component.extend, 'function')
      assert.deepEqual(Component.defaults.data, { message: 'World', answer: 42, shared: {} })

      assert.ok(Component.components.hasOwnProperty('MyComponent'))
      assert.strictEqual(typeof Component.components.MyComponent, 'function')
      assert.strictEqual(typeof Component.components.MyComponent.extend, 'function')
      assert.deepEqual(Component.components.MyComponent.defaults.data, {})
      assert.deepEqual(Component.components.MyComponent.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'my-component', 't': 13 }], 'f': ['My Component'] }] })
    })

    assert.deepEqual(components[0].defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'component-1', 't': 13 }], 'f': [{ 't': 7, 'e': 'div', 'f': ['Hello, ', { 't': 2, 'r': 'message' }, '!'] }, ' ', { 't': 7, 'e': 'div', 'f': ['Answer to the Ultimate Question of Life, the Universe, and Everything: ', { 't': 2, 'r': 'answer' }] }, ' ', { 't': 7, 'e': 'MyComponent' }] }] })

    assert.deepEqual(components[1].defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'component-2', 't': 13 }], 'f': [{ 't': 7, 'e': 'div', 'f': ['Hello, ', { 't': 2, 'r': 'message' }, '!'] }, ' ', { 't': 7, 'e': 'div', 'f': ['Answer to the Ultimate Question of Life, the Universe, and Everything: ', { 't': 2, 'r': 'answer' }] }, ' ', { 't': 7, 'e': 'MyComponent' }] }] })

    const html = (n, cssId) => `<div class="component-${n}" data-ractive-css='{${cssId}}'><div>Hello, World!</div> <div>Answer to the Ultimate Question of Life, the Universe, and Everything: 42</div> <div class='my-component'>My Component</div></div>`

    const instance1 = components[0]({ el: '#qunit-fixture', append: true })
    const cssId1 = components[0].defaults.cssId
    const html1 = html(1, cssId1)

    const instance2 = components[1]({ el: '#qunit-fixture', append: true })
    const cssId2 = components[1].defaults.cssId
    const html2 = html(2, cssId2)

    assert.htmlEqual(instance1.toHTML(), html1)
    assert.htmlEqual(instance2.toHTML(), html2)
    assert.htmlEqual(document.getElementById('qunit-fixture').innerHTML, `${html1}${html2}`)

    // Ensure the dependencies are only ever evaluated once
    assert.ok(components[0].defaults.data.answer === components[1].defaults.data.answer)
    assert.ok(components[0].defaults.data.shared === components[1].defaults.data.shared)
    assert.ok(components[0].components.MyComponent === components[1].components.MyComponent)
  })
})

test('duplicate require', assert => {
  return loadComponent('/base/test/samples/relative-component/', 'component.ractive.html', { shared: {} }).then(Component => {
    assert.strictEqual(typeof Component, 'function')
    assert.strictEqual(typeof Component.extend, 'function')
    assert.ok(Component.defaults.data.shared1 === Component.defaults.data.shared2)
  })
})

test('duplicate link href', assert => {
  return loadComponent('/base/test/samples/duplicate-link-href/', 'component.ractive.html', { shared: {} }).then(Component => {
    assert.strictEqual(typeof Component, 'function')
    assert.strictEqual(typeof Component.extend, 'function')

    assert.ok(Component.components.hasOwnProperty('MyComponent'))
    assert.strictEqual(typeof Component.components.MyComponent, 'function')
    assert.strictEqual(typeof Component.components.MyComponent.extend, 'function')

    // Ensure all 3 point to the same constructor
    assert.ok(Component.components.MyComponent === Component.components.MyOtherComponent)
    assert.ok(Component.components.MyOtherComponent === Component.components.YetAnotherComponent)
    assert.ok(Component.components.YetAnotherComponent === Component.components.MyComponent)
  })
})

test('duplicate link name', assert => {
  return loadComponent('/base/test/samples/duplicate-link-name/', 'component.ractive.html', { shared: {} }).then(Component => {
    assert.strictEqual(typeof Component, 'function')
    assert.strictEqual(typeof Component.extend, 'function')

    // The loader will not try to be clever. It will just overwrite the
    // registration with the latest linked component.
    assert.ok(Component.components.hasOwnProperty('MyComponent'))
    assert.strictEqual(typeof Component.components.MyComponent, 'function')
    assert.strictEqual(typeof Component.components.MyComponent.extend, 'function')
    assert.deepEqual(Component.components.MyComponent.defaults.template, { 'v': 4, 't': [{ 't': 7, 'e': 'div', 'm': [{ 'n': 'class', 'f': 'yet-another-component', 't': 13 }], 'f': ['Yet Another Component'] }] })

    const instance = Component({ el: '#qunit-fixture' })
    const html = `<div class='yet-another-component'>Yet Another Component</div>`

    assert.htmlEqual(instance.toHTML(), html)
    assert.htmlEqual(document.getElementById('qunit-fixture').innerHTML, html)
  })
})
