import pkg from '../package.json'
import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  sourcemap: true,
  plugins: [
    nodeResolve(),
    buble({transforms: { modules: false }})
  ],
  input: 'src/index.js',
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' }
  ],
  // Bundle utils-component APIs but keep Ractive external.
  external: ['@ractivejs/core']
}
