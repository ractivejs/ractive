import pkg from '../package.json'
import buble from 'rollup-plugin-buble'
import alias from 'rollup-plugin-alias'
import { resolve } from 'path'

export default {
  sourcemap: true,
  plugins: [
    alias({ resolve: ['.mjs'], [pkg.name]: resolve('./dist/lib') }),
    buble({transforms: { modules: false }})
  ],
  input: 'test/index.js',
  output: { file: 'tmp/test.js', format: 'cjs' },
  external: ['fs', 'rollup', 'qunit', '@ractivejs/core'],
  globals: { qunit: 'QUnit' }
}
