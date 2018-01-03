import { module, test } from 'qunit'
import { loadComponent, loadComponents } from '@ractivejs/loader-browser'

module('loader-browser')

test('loadComponent on reference', assert => {
  return loadComponent('/base/test/samples/reference/', 'component.ractive.html', { answer: 42 }).then(constructor => {
    debugger;
    // Check if constructor is a constructor
    // Check if it renders correctly
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
