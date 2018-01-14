import pkg from '../package.json'
import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  sourcemap: true,
  plugins: [
    nodeResolve(),
    commonjs(),
    buble({transforms: { modules: false }})
  ],
  input: 'src/index.js',
  output: [
    { file: pkg.main, format: 'umd', name: pkg.name },
    { file: pkg.module, format: 'es' }
  ],
  globals: {
    '@ractivejs/core': 'Ractive'
  },
  external: [
    '@ractivejs/core'
  ]
}