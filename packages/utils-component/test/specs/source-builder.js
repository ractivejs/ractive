/* eslint-env browser */
import { module, test } from 'qunit'
import { toParts, toCJS, toAMD, toES } from '@ractivejs/utils-component'

module('source-builder')

const specs = [
  'reference',
  'reordered',
  'script-only',
  'style-only',
  'template-only',
  'links-only',
  'duplicate-link-href',
  'duplicate-link-name',
  'duplicate-require',
  'empty-top-levels',
  'script-with-mustache',
  'style-with-mustache',
  'non-dependency-requires'
]

specs.forEach((spec, index) => {
  test(`${spec} source builder`, assert => {
    const sampleDir = `/base/test/samples/${spec}`
    const sample = fetch(`${sampleDir}/component.ractive.html`).then(r => r.text())
    const expectedParts = fetch(`${sampleDir}/component.parts.json`).then(r => r.json())
    const expectedCJS = fetch(`${sampleDir}/component.cjs.js`).then(r => r.text())
    const expectedAMD = fetch(`${sampleDir}/component.amd.js`).then(r => r.text())
    const expectedES = fetch(`${sampleDir}/component.es.js`).then(r => r.text())
    const expectedCJSMap = fetch(`${sampleDir}/component.cjs.js.map`).then(r => r.json())
    const expectedAMDMap = fetch(`${sampleDir}/component.amd.js.map`).then(r => r.json())
    const expectedESMap = fetch(`${sampleDir}/component.es.js.map`).then(r => r.json())
    const requests = [ sample, expectedParts, expectedCJS, expectedAMD, expectedES, expectedCJSMap, expectedAMDMap, expectedESMap ]

    return Promise.all(requests).then(([ sample, expectedParts, expectedCJS, expectedAMD, expectedES, expectedCJSMap, expectedAMDMap, expectedESMap ]) => {
      const parts = toParts('component.ractive.html', sample)
      const actualCJS = toCJS('component.cjs.js', parts)
      const actualAMD = toAMD('component.amd.js', parts)
      const actualES = toES('component.es.js', parts)

      assert.deepEqual(parts, expectedParts, `${spec} parsed correctly`)
      assert.strictEqual(actualCJS.code, expectedCJS, `${spec} toCJS code correctly`)
      assert.strictEqual(actualAMD.code, expectedAMD, `${spec} toAMD code correctly`)
      assert.strictEqual(actualES.code, expectedES, `${spec} toES code correctly`)
      assert.deepEqual(actualCJS.map, expectedCJSMap, `${spec} toCJS map correctly`)
      assert.deepEqual(actualAMD.map, expectedAMDMap, `${spec} toAMD map correctly`)
      assert.deepEqual(actualES.map, expectedESMap, `${spec} toES map correctly`)
    })
  })
})
