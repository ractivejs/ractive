
import { readFileSync } from 'fs'
import { rollup } from 'rollup'
import loader from '@ractivejs/loader-rollup'

// Because the cli injects QUnit as a global. That's annoying.
// eslint-disable-next-line
const { module, test } = QUnit

module('loader-rollup')

const specs = [
  'reference'
]

specs.forEach(spec => {
  test(spec, assert => {
    const expectedES = readFileSync(`test/samples/${spec}/bundle.es.js`, { encoding: 'utf8' })
    const expectedAMD = readFileSync(`test/samples/${spec}/bundle.amd.js`, { encoding: 'utf8' })
    const expectedCJS = readFileSync(`test/samples/${spec}/bundle.cjs.js`, { encoding: 'utf8' })

    return rollup({
      input: `test/samples/${spec}/main.js`,
      plugins: [loader()]
    }).then(bundle => {
      return Promise.all([
        bundle.generate({ format: 'es' }),
        bundle.generate({ format: 'amd' }),
        bundle.generate({ format: 'cjs' })
      ])
    }).then(([actualES, actualAMD, actualCJS]) => {
      assert.strictEqual(actualES.code, expectedES)
      assert.strictEqual(actualAMD.code, expectedAMD)
      assert.strictEqual(actualCJS.code, expectedCJS)
    })
  })
})
