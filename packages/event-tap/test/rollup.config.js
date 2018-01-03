import pkg from '../package.json'
import buble from 'rollup-plugin-buble'
import alias from 'rollup-plugin-alias'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import { resolve } from 'path'

export default {
  sourcemap: true,
  plugins: [
    nodeResolve(),
    commonjs(),
    alias({ resolve: ['.mjs'], [pkg.name]: resolve('./dist/lib') }),
    buble({transforms: { modules: false }})
  ],
  input: 'test/index.js',
  output: { file: 'tmp/test.js', format: 'iife' },
  globals: { qunit: 'QUnit' },
  external: [ 'qunit' ]
}