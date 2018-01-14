import { module, test } from 'qunit'
import { getComponentName, getComponentPath, isComponent, replaceExtension } from '@ractivejs/utils-component'

module('utils')

test(`getComponentName`, assert => {
  const specs = [
    { input: 'MyComponent', expected: 'MyComponent' },
    { input: 'MyComponent.html', expected: 'MyComponent' },
    { input: 'MyComponent.ractive.html', expected: 'MyComponent' },
    { input: 'path/to/MyComponent', expected: 'MyComponent' },
    { input: 'path/to/MyComponent.html', expected: 'MyComponent' },
    { input: 'path/to/MyComponent.ractive.html', expected: 'MyComponent' },
    { input: '/path/to/MyComponent', expected: 'MyComponent' },
    { input: '/path/to/MyComponent.html', expected: 'MyComponent' },
    { input: '/path/to/MyComponent.ractive.html', expected: 'MyComponent' },
    { input: './path/to/MyComponent', expected: 'MyComponent' },
    { input: './path/to/MyComponent.html', expected: 'MyComponent' },
    { input: './path/to/MyComponent.ractive.html', expected: 'MyComponent' },
    { input: '../path/to/MyComponent', expected: 'MyComponent' },
    { input: '../path/to/MyComponent.html', expected: 'MyComponent' },
    { input: '../path/to/MyComponent.ractive.html', expected: 'MyComponent' }
  ]

  specs.forEach(({ input, expected }) => {
    assert.strictEqual(getComponentName(input), expected)
  })
})

test(`getComponentPath valid`, assert => {
  const specs = [
    // Returns path if base is missing
    { base: '', path: 'MyComponent.ractive.html', expected: 'MyComponent.ractive.html' },
    { base: '', path: '/MyComponent.ractive.html', expected: '/MyComponent.ractive.html' },
    { base: '', path: './MyComponent.ractive.html', expected: './MyComponent.ractive.html' },
    { base: '', path: '../MyComponent.ractive.html', expected: '../MyComponent.ractive.html' },
    { base: '', path: 'path/to/MyComponent.ractive.html', expected: 'path/to/MyComponent.ractive.html' },
    { base: '', path: '/path/to/MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    { base: '', path: './path/to/MyComponent.ractive.html', expected: './path/to/MyComponent.ractive.html' },
    { base: '', path: '../path/to/MyComponent.ractive.html', expected: '../path/to/MyComponent.ractive.html' },

    // Returns path if supplied with file name
    { base: 'MyOtherComponent.ractive.html', path: 'MyComponent.ractive.html', expected: 'MyComponent.ractive.html' },
    { base: 'MyOtherComponent.ractive.html', path: '/MyComponent.ractive.html', expected: '/MyComponent.ractive.html' },
    { base: 'MyOtherComponent.ractive.html', path: './MyComponent.ractive.html', expected: 'MyComponent.ractive.html' },
    // { base: 'MyOtherComponent.ractive.html', path: '../MyComponent.ractive.html', expected: 'SHOULD BLOW UP' },
    { base: 'MyOtherComponent.ractive.html', path: 'path/to/MyComponent.ractive.html', expected: 'path/to/MyComponent.ractive.html' },
    { base: 'MyOtherComponent.ractive.html', path: '/path/to/MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    { base: 'MyOtherComponent.ractive.html', path: './path/to/MyComponent.ractive.html', expected: 'path/to/MyComponent.ractive.html' },
    // { base: 'MyOtherComponent.ractive.html', path: '../path/to/MyComponent.ractive.html', expected: 'SHOULD BLOW UP' },

    // Relative to domain
    { base: '/', path: 'MyComponent.ractive.html', expected: '/MyComponent.ractive.html' },
    { base: '/', path: '/MyComponent.ractive.html', expected: '/MyComponent.ractive.html' },
    { base: '/', path: './MyComponent.ractive.html', expected: '/MyComponent.ractive.html' },
    // { base: '/', path: '../MyComponent.ractive.html', expected: 'SHOULD BLOW UP' },
    { base: '/', path: 'path/to/MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    { base: '/', path: '/path/to/MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    { base: '/', path: './path/to/MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    // { base: '/', path: '../path/to/MyComponent.ractive.html', expected: 'SHOULD BLOW UP' },

    // Relative to single-segment path (ensure it doesn't pop off the only segment)
    { base: 'path/', path: 'MyComponent.ractive.html', expected: 'path/MyComponent.ractive.html' },
    { base: 'path/', path: '/MyComponent.ractive.html', expected: '/MyComponent.ractive.html' },
    { base: 'path/', path: './MyComponent.ractive.html', expected: 'path/MyComponent.ractive.html' },
    { base: 'path/', path: '../MyComponent.ractive.html', expected: 'MyComponent.ractive.html' },
    { base: 'path/', path: 'path/to/MyComponent.ractive.html', expected: 'path/path/to/MyComponent.ractive.html' },
    { base: 'path/', path: '/path/to/MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    { base: 'path/', path: './path/to/MyComponent.ractive.html', expected: 'path/path/to/MyComponent.ractive.html' },
    { base: 'path/', path: '../path/to/MyComponent.ractive.html', expected: 'path/to/MyComponent.ractive.html' },

    // Deep paths
    { base: 'path/to/', path: 'MyComponent.ractive.html', expected: 'path/to/MyComponent.ractive.html' },
    { base: 'path/to/', path: '/MyComponent.ractive.html', expected: '/MyComponent.ractive.html' },
    { base: 'path/to/', path: './MyComponent.ractive.html', expected: 'path/to/MyComponent.ractive.html' },
    { base: 'path/to/', path: '../MyComponent.ractive.html', expected: 'path/MyComponent.ractive.html' },
    { base: 'path/to/', path: 'path/to/MyComponent.ractive.html', expected: 'path/to/path/to/MyComponent.ractive.html' },
    { base: 'path/to/', path: '/path/to/MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    { base: 'path/to/', path: './path/to/MyComponent.ractive.html', expected: 'path/to/path/to/MyComponent.ractive.html' },
    { base: 'path/to/', path: '../path/to/MyComponent.ractive.html', expected: 'path/path/to/MyComponent.ractive.html' },

    // Paths with component file name
    { base: 'path/to/MyOtherComponent.ractive.html', path: 'MyComponent.ractive.html', expected: 'path/to/MyComponent.ractive.html' },
    { base: 'path/to/MyOtherComponent.ractive.html', path: '/MyComponent.ractive.html', expected: '/MyComponent.ractive.html' },
    { base: 'path/to/MyOtherComponent.ractive.html', path: './MyComponent.ractive.html', expected: 'path/to/MyComponent.ractive.html' },
    { base: 'path/to/MyOtherComponent.ractive.html', path: '../MyComponent.ractive.html', expected: 'path/MyComponent.ractive.html' },
    { base: 'path/to/MyOtherComponent.ractive.html', path: 'path/to/MyComponent.ractive.html', expected: 'path/to/path/to/MyComponent.ractive.html' },
    { base: 'path/to/MyOtherComponent.ractive.html', path: '/path/to/MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    { base: 'path/to/MyOtherComponent.ractive.html', path: './path/to/MyComponent.ractive.html', expected: 'path/to/path/to/MyComponent.ractive.html' },
    { base: 'path/to/MyOtherComponent.ractive.html', path: '../path/to/MyComponent.ractive.html', expected: 'path/path/to/MyComponent.ractive.html' },

    // Deep paths relative to domain
    { base: '/path/to/', path: 'MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    { base: '/path/to/', path: '/MyComponent.ractive.html', expected: '/MyComponent.ractive.html' },
    { base: '/path/to/', path: './MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    { base: '/path/to/', path: '../MyComponent.ractive.html', expected: '/path/MyComponent.ractive.html' },
    { base: '/path/to/', path: 'path/to/MyComponent.ractive.html', expected: '/path/to/path/to/MyComponent.ractive.html' },
    { base: '/path/to/', path: '/path/to/MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    { base: '/path/to/', path: './path/to/MyComponent.ractive.html', expected: '/path/to/path/to/MyComponent.ractive.html' },
    { base: '/path/to/', path: '../path/to/MyComponent.ractive.html', expected: '/path/path/to/MyComponent.ractive.html' },

    // Paths relative to domain with component file name
    { base: '/path/to/MyOtherComponent.ractive.html', path: 'MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    { base: '/path/to/MyOtherComponent.ractive.html', path: '/MyComponent.ractive.html', expected: '/MyComponent.ractive.html' },
    { base: '/path/to/MyOtherComponent.ractive.html', path: './MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    { base: '/path/to/MyOtherComponent.ractive.html', path: '../MyComponent.ractive.html', expected: '/path/MyComponent.ractive.html' },
    { base: '/path/to/MyOtherComponent.ractive.html', path: 'path/to/MyComponent.ractive.html', expected: '/path/to/path/to/MyComponent.ractive.html' },
    { base: '/path/to/MyOtherComponent.ractive.html', path: '/path/to/MyComponent.ractive.html', expected: '/path/to/MyComponent.ractive.html' },
    { base: '/path/to/MyOtherComponent.ractive.html', path: './path/to/MyComponent.ractive.html', expected: '/path/to/path/to/MyComponent.ractive.html' },
    { base: '/path/to/MyOtherComponent.ractive.html', path: '../path/to/MyComponent.ractive.html', expected: '/path/path/to/MyComponent.ractive.html' }

  ]

  specs.forEach(({ base, path, expected }, index) => {
    assert.strictEqual(getComponentPath(path, base), expected)
  })
})

test('getComponentPath invalid', assert => {
  const specs = [
    { base: 'path/', path: '../../MyComponent.ractive.html' },
    { base: 'path/to/', path: '../../../MyComponent.ractive.html' },
    { base: '/', path: '../MyComponent.ractive.html' },
    { base: '/path/', path: '../../MyComponent.ractive.html' },
    { base: '/path/to', path: '../../../MyComponent.ractive.html' },
    { base: 'MyOtherComponent.ractive.html', path: '../MyComponent.ractive.html' },
    { base: 'path/MyOtherComponent.ractive.html', path: '../../MyComponent.ractive.html' },
    { base: 'path/to/MyOtherComponent.ractive.html', path: '../../../MyComponent.ractive.html' }
  ]

  specs.forEach(({ base, path }) => {
    assert.throws(() => { getComponentPath(path, base) }, Error)
  })
})

test(`isComponentPath`, assert => {
  const specs = [
    'MyComponent.html',
    'MyComponent.ractive.html',
    'path/to/MyComponent.html',
    'path/to/MyComponent.ractive.html',
    '/path/to/MyComponent.html',
    '/path/to/MyComponent.ractive.html',
    './path/to/MyComponent.html',
    './path/to/MyComponent.ractive.html',
    '../path/to/MyComponent.html',
    '../path/to/MyComponent.ractive.html'
  ]

  specs.forEach(spec => {
    assert.ok(isComponent(spec))
  })
})

test(`replaceExtension`, assert => {
  const specs = [
    { path: 'MyComponent.html', ext: '.js', expected: 'MyComponent.js' },
    { path: '/MyComponent.html', ext: '.js', expected: '/MyComponent.js' },
    { path: './MyComponent.html', ext: '.js', expected: './MyComponent.js' },
    { path: '../MyComponent.html', ext: '.js', expected: '../MyComponent.js' },
    { path: 'path/to/MyComponent.html', ext: '.js', expected: 'path/to/MyComponent.js' },
    { path: '/path/to/MyComponent.html', ext: '.js', expected: '/path/to/MyComponent.js' },
    { path: './path/to/MyComponent.html', ext: '.js', expected: './path/to/MyComponent.js' },
    { path: '../path/to/MyComponent.html', ext: '.js', expected: '../path/to/MyComponent.js' },
    { path: 'MyComponent.ractive.html', ext: '.js', expected: 'MyComponent.js' },
    { path: '/MyComponent.ractive.html', ext: '.js', expected: '/MyComponent.js' },
    { path: './MyComponent.ractive.html', ext: '.js', expected: './MyComponent.js' },
    { path: '../MyComponent.ractive.html', ext: '.js', expected: '../MyComponent.js' },
    { path: 'path/to/MyComponent.ractive.html', ext: '.js', expected: 'path/to/MyComponent.js' },
    { path: '/path/to/MyComponent.ractive.html', ext: '.js', expected: '/path/to/MyComponent.js' },
    { path: './path/to/MyComponent.ractive.html', ext: '.js', expected: './path/to/MyComponent.js' },
    { path: '../path/to/MyComponent.ractive.html', ext: '.js', expected: '../path/to/MyComponent.js' }
  ]

  specs.forEach(({ path, ext, expected }, index) => {
    assert.strictEqual(replaceExtension(path, ext), expected)
  })
})
