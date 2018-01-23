/* eslint-env browser */
import { module, test } from 'qunit'
import { toParts, toConstructor } from '@ractivejs/utils-component'
import Ractive from '@ractivejs/core'

module('constructor-builder')

test(`duplicate-link-href`, assert => {
  return fetch(`/base/test/samples/duplicate-link-href/component.ractive.html`).then(r => r.text()).then(sample => {
    const dependencies = {
      './path/to/MyComponent.ractive.html': Ractive.extend({ template: '<div class="my-component">My Component</div>' }),
    }
    const parts = toParts('component.ractive.html', sample)
    const constructor = toConstructor('component.js', parts, id => dependencies[id])

    assert.strictEqual(typeof constructor.extend, 'function')
    assert.strictEqual(constructor.components.MyComponent, dependencies['./path/to/MyComponent.ractive.html'])
    assert.strictEqual(constructor.components.MyOtherComponent, dependencies['./path/to/MyComponent.ractive.html'])
    assert.strictEqual(constructor.components.YetAnotherComponent, dependencies['./path/to/MyComponent.ractive.html'])

    const instance = constructor({ el: '#qunit-fixture', data: { a: 1, b: 2 } })

    assert.htmlEqual(instance.toHTML(), '')
    assert.strictEqual(instance.toCSS(), '/* Ractive.js component styles */')
    assert.strictEqual(instance.get('a'), 1)
    assert.strictEqual(instance.get('b'), 2)
  })
})

test(`duplicate-link-name`, assert => {
  return fetch(`/base/test/samples/duplicate-link-name/component.ractive.html`).then(r => r.text()).then(sample => {
    const dependencies = {
      './path/to/MyComponent.ractive.html': Ractive.extend({ template: '<div class="my-component">My Component</div>' }),
      './path/to/MyOtherComponent.ractive.html': Ractive.extend({ template: '<div class="my-other-component">My Other Component</div>' }),
      './path/to/YetAnotherComponent.ractive.html': Ractive.extend({ template: '<div class="yet-another-component">Yet Another Component</div>' })
    }
    const parts = toParts('component.ractive.html', sample)
    const constructor = toConstructor('component.js', parts, id => dependencies[id])

    assert.strictEqual(typeof constructor.extend, 'function')
    assert.strictEqual(constructor.components.MyComponent, dependencies['./path/to/YetAnotherComponent.ractive.html'])

    const instance = constructor({ el: '#qunit-fixture', data: { a: 1, b: 2 } })

    assert.htmlEqual(instance.toHTML(), '')
    assert.strictEqual(instance.toCSS(), '/* Ractive.js component styles */')
    assert.strictEqual(instance.get('a'), 1)
    assert.strictEqual(instance.get('b'), 2)
  })
})

test(`duplicate-require`, assert => {
  // Duplicate require is a test for toParts, ensuring duplicates are only
  // recognized once. All we can do here is ensure the call is done twice, as
  // per the component file.
  assert.expect(7)

  return fetch(`/base/test/samples/duplicate-require/component.ractive.html`).then(r => r.text()).then(sample => {
    const dependencies = {
      'hhgttg': 42
    }
    const parts = toParts('component.ractive.html', sample)
    const constructor = toConstructor('component.js', parts, id => {
      assert.ok(true)
      return dependencies[id]
    })

    assert.strictEqual(typeof constructor.extend, 'function')

    const instance = constructor({ el: '#qunit-fixture', data: { a: 1, b: 2 } })

    assert.htmlEqual(instance.toHTML(), '')
    assert.strictEqual(instance.toCSS(), '/* Ractive.js component styles */')
    assert.strictEqual(instance.get('a'), 1)
    assert.strictEqual(instance.get('b'), 2)
  })
})

test(`empty-top-levels`, assert => {
  return fetch(`/base/test/samples/empty-top-levels/component.ractive.html`).then(r => r.text()).then(sample => {
    const parts = toParts('component.ractive.html', sample)
    const constructor = toConstructor('component.js', parts, id => {
      throw new Error('THIS SHOULD NEVER BE CALLED')
    })

    assert.strictEqual(typeof constructor.extend, 'function')

    const instance = constructor({ el: '#qunit-fixture', data: { a: 1, b: 2 } })

    assert.htmlEqual(instance.toHTML(), '')
    assert.strictEqual(instance.toCSS(), '/* Ractive.js component styles */')
    assert.strictEqual(instance.get('a'), 1)
    assert.strictEqual(instance.get('b'), 2)
  })
})

test(`links-only`, assert => {
  return fetch(`/base/test/samples/links-only/component.ractive.html`).then(r => r.text()).then(sample => {
    const dependencies = {
      './path/to/MyComponent.ractive.html': Ractive.extend({ template: '<div class="my-component">My Component</div>' }),
      './path/to/MyOtherComponent.ractive.html': Ractive.extend({ template: '<div class="my-other-component">My Other Component</div>' }),
      './path/to/YetAnotherComponent.ractive.html': Ractive.extend({ template: '<div class="yet-another-component">Yet Another Component</div>' })
    }
    const parts = toParts('component.ractive.html', sample)
    const constructor = toConstructor('component.js', parts, id => dependencies[id])

    assert.strictEqual(typeof constructor.extend, 'function')
    assert.strictEqual(constructor.components.MyComponent, dependencies['./path/to/MyComponent.ractive.html'])
    assert.strictEqual(constructor.components.MyOtherComponent, dependencies['./path/to/MyOtherComponent.ractive.html'])
    assert.strictEqual(constructor.components.YetAnotherComponent, dependencies['./path/to/YetAnotherComponent.ractive.html'])

    const instance = constructor({ el: '#qunit-fixture', data: { a: 1, b: 2 } })

    assert.htmlEqual(instance.toHTML(), '')
    assert.strictEqual(instance.toCSS(), '/* Ractive.js component styles */')
    assert.strictEqual(instance.get('a'), 1)
    assert.strictEqual(instance.get('b'), 2)
  })
})

test(`reference`, assert => {
  return fetch(`/base/test/samples/reference/component.ractive.html`).then(r => r.text()).then(sample => {
    const dependencies = {
      'hhgttg': 42,
      './path/to/MyComponent.ractive.html': Ractive.extend({ template: '<div class="my-component">My Component</div>' }),
      './path/to/MyOtherComponent.ractive.html': Ractive.extend({ template: '<div class="my-other-component">My Other Component</div>' }),
      './path/to/YetAnotherComponent.ractive.html': Ractive.extend({ template: '<div class="yet-another-component">Yet Another Component</div>' })
    }
    const parts = toParts('component.ractive.html', sample)
    const constructor = toConstructor('component.js', parts, id => dependencies[id])

    assert.strictEqual(typeof constructor.extend, 'function')
    assert.strictEqual(constructor.components.MyComponent, dependencies['./path/to/MyComponent.ractive.html'])
    assert.strictEqual(constructor.components.MyOtherComponent, dependencies['./path/to/MyOtherComponent.ractive.html'])
    assert.strictEqual(constructor.components.YetAnotherComponent, dependencies['./path/to/YetAnotherComponent.ractive.html'])

    const instance = constructor({ el: '#qunit-fixture', data: { a: 1, b: 2 } })
    const cssId = constructor.defaults.cssId

    assert.htmlEqual(instance.toHTML(), `<div data-ractive-css="{${cssId}}">Hello, World!</div> <div data-ractive-css="{${cssId}}">Answer to the Ultimate Question of Life, the Universe, and Everything: 42</div> <div data-ractive-css="{${cssId}}">Expression 3</div> <div class="my-component" data-ractive-css="{${cssId}}">My Component</div> <div class="my-other-component" data-ractive-css="{${cssId}}">My Other Component</div> <div class="yet-another-component" data-ractive-css="{${cssId}}">Yet Another Component</div>`)
    assert.strictEqual(instance.toCSS(), `/* Ractive.js component styles */\n\n/* {${cssId}} */\n\n  div[data-ractive-css~="{${cssId}}"], [data-ractive-css~="{${cssId}}"] div {\n    color: red\n  }\n`)
    assert.strictEqual(instance.get('user'), 'World')
    assert.strictEqual(instance.get('answer'), 42)
    assert.strictEqual(instance.get('a'), 1)
    assert.strictEqual(instance.get('b'), 2)
  })
})

test(`reordered`, assert => {
  return fetch(`/base/test/samples/reordered/component.ractive.html`).then(r => r.text()).then(sample => {
    const dependencies = {
      'hhgttg': 42,
      './path/to/MyComponent.ractive.html': Ractive.extend({ template: '<div class="my-component">My Component</div>' }),
      './path/to/MyOtherComponent.ractive.html': Ractive.extend({ template: '<div class="my-other-component">My Other Component</div>' }),
      './path/to/YetAnotherComponent.ractive.html': Ractive.extend({ template: '<div class="yet-another-component">Yet Another Component</div>' })
    }
    const parts = toParts('component.ractive.html', sample)
    const constructor = toConstructor('component.js', parts, id => dependencies[id])

    assert.strictEqual(typeof constructor.extend, 'function')
    assert.strictEqual(constructor.components.MyComponent, dependencies['./path/to/MyComponent.ractive.html'])
    assert.strictEqual(constructor.components.MyOtherComponent, dependencies['./path/to/MyOtherComponent.ractive.html'])
    assert.strictEqual(constructor.components.YetAnotherComponent, dependencies['./path/to/YetAnotherComponent.ractive.html'])

    const instance = constructor({ el: '#qunit-fixture', data: { a: 1, b: 2 } })
    const cssId = constructor.defaults.cssId

    assert.htmlEqual(instance.toHTML(), `<div data-ractive-css="{${cssId}}">Hello, World!</div> <div data-ractive-css="{${cssId}}">Answer to the Ultimate Question of Life, the Universe, and Everything: 42</div> <div data-ractive-css="{${cssId}}">Expression 3</div> <div class="my-component" data-ractive-css="{${cssId}}">My Component</div> <div class="my-other-component" data-ractive-css="{${cssId}}">My Other Component</div> <div class="yet-another-component" data-ractive-css="{${cssId}}">Yet Another Component</div>`)
    assert.strictEqual(instance.toCSS(), `/* Ractive.js component styles */\n\n/* {${cssId}} */\n\n  div[data-ractive-css~="{${cssId}}"], [data-ractive-css~="{${cssId}}"] div {\n    color: red\n  }\n`)
    assert.strictEqual(instance.get('user'), 'World')
    assert.strictEqual(instance.get('answer'), 42)
    assert.strictEqual(instance.get('a'), 1)
    assert.strictEqual(instance.get('b'), 2)
  })
})

test(`script-only`, assert => {
  return fetch(`/base/test/samples/script-only/component.ractive.html`).then(r => r.text()).then(sample => {
    const dependencies = {
      'hhgttg': 42
    }
    const parts = toParts('component.ractive.html', sample)
    const constructor = toConstructor('component.js', parts, id => dependencies[id])

    assert.strictEqual(typeof constructor.extend, 'function')

    const instance = constructor({ el: '#qunit-fixture', data: { a: 1, b: 2 } })

    assert.htmlEqual(instance.toHTML(), '')
    assert.strictEqual(instance.toCSS(), '/* Ractive.js component styles */')
    assert.strictEqual(instance.get('user'), 'World')
    assert.strictEqual(instance.get('answer'), 42)
    assert.strictEqual(instance.get('a'), 1)
    assert.strictEqual(instance.get('b'), 2)
  })
})

test(`script-with-mustache`, assert => {
  return fetch(`/base/test/samples/script-with-mustache/component.ractive.html`).then(r => r.text()).then(sample => {
    const parts = toParts('component.ractive.html', sample)
    const constructor = toConstructor('component.js', parts, id => {
      throw new Error('THIS SHOULD NEVER BE CALLED')
    })

    assert.strictEqual(typeof constructor.extend, 'function')

    const instance = constructor({ el: '#qunit-fixture', data: { a: 1, b: 2 } })

    assert.htmlEqual(instance.toHTML(), '')
    assert.strictEqual(instance.toCSS(), '/* Ractive.js component styles */')
    assert.strictEqual(instance.get('a'), 1)
    assert.strictEqual(instance.get('b'), 2)
  })
})

test(`style-only`, assert => {
  return fetch(`/base/test/samples/style-only/component.ractive.html`).then(r => r.text()).then(sample => {
    const parts = toParts('component.ractive.html', sample)
    const constructor = toConstructor('component.js', parts, id => {
      throw new Error('THIS SHOULD NEVER BE CALLED')
    })

    assert.strictEqual(typeof constructor.extend, 'function')

    const instance = constructor({ el: '#qunit-fixture', data: { a: 1, b: 2 } })
    const cssId = constructor.defaults.cssId

    assert.htmlEqual(instance.toHTML(), '')
    assert.strictEqual(instance.toCSS(), `/* Ractive.js component styles */\n\n/* {${cssId}} */\n\n  div[data-ractive-css~="{${cssId}}"], [data-ractive-css~="{${cssId}}"] div {\n    color: red\n  }\n`)
    assert.strictEqual(instance.get('a'), 1)
    assert.strictEqual(instance.get('b'), 2)
  })
})

test(`style-with-mustache`, assert => {
  return fetch(`/base/test/samples/style-with-mustache/component.ractive.html`).then(r => r.text()).then(sample => {
    const parts = toParts('component.ractive.html', sample)
    const constructor = toConstructor('component.js', parts, id => {
      throw new Error('THIS SHOULD NEVER BE CALLED')
    })

    assert.strictEqual(typeof constructor.extend, 'function')

    const instance = constructor({ el: '#qunit-fixture', data: { a: 1, b: 2 } })
    const cssId = constructor.defaults.cssId

    assert.htmlEqual(instance.toHTML(), '')
    assert.strictEqual(instance.toCSS(), `/* Ractive.js component styles */\n\n/* {${cssId}} */\n\n  div[data-ractive-css~="{${cssId}}"], [data-ractive-css~="{${cssId}}"] div {\n    content: '{{uninterpolated}}'\n  }\n`)
    assert.strictEqual(instance.get('a'), 1)
    assert.strictEqual(instance.get('b'), 2)
  })
})

test(`template-only`, assert => {
  return fetch(`/base/test/samples/template-only/component.ractive.html`).then(r => r.text()).then(sample => {
    const parts = toParts('component.ractive.html', sample)
    const constructor = toConstructor('component.js', parts, id => {
      throw new Error('THIS SHOULD NEVER BE CALLED')
    })

    assert.strictEqual(typeof constructor.extend, 'function')

    const instance = constructor({ el: '#qunit-fixture', data: { a: 1, b: 2 } })

    assert.htmlEqual(instance.toHTML(), `<div>Hello, !</div> <div>Answer to the Ultimate Question of Life, the Universe, and Everything: </div> <div>Expression 3</div> <MyComponent></MyComponent> <MyOtherComponent></MyOtherComponent> <YetAnotherComponent></YetAnotherComponent>`)
    assert.strictEqual(instance.toCSS(), '/* Ractive.js component styles */')
    assert.strictEqual(instance.get('a'), 1)
    assert.strictEqual(instance.get('b'), 2)
  })
})

// TODO: implementation matches methods named require
// test(`non-dependency-requires`, assert => {
//   // Detection of unwanted requires is part of the toParts test, which is in
//   // source-builder.js. All we can do here is to ensure that the resolver is
//   // never called at runtime.
//   return fetch(`/base/test/samples/non-dependency-requires/component.ractive.html`).then(r => r.text()).then(sample => {
//     const parts = toParts('component.ractive.html', sample)
//     const constructor = toConstructor('component.js', parts, id => {
//       throw new Error('THIS SHOULD NEVER BE CALLED')
//     })

//     assert.strictEqual(typeof constructor.extend, 'function')

//     const instance = constructor({ el: '#qunit-fixture', data: { a: 1, b: 2 } })

//     assert.htmlEqual(instance.toHTML(), '')
//     assert.strictEqual(instance.toCSS(), '/* Ractive.js component styles */')
//     assert.strictEqual(instance.get('a'), 1)
//     assert.strictEqual(instance.get('b'), 2)
//   })
// })
