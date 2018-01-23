import pkg from '../package.json'
import buble from 'rollup-plugin-buble'

export default {
  sourcemap: true,
  plugins: [
    buble({transforms: { modules: false }})
  ],
  input: 'src/index.js',
  output: [
    { file: pkg.main, format: 'umd', name: pkg.name },
    { file: pkg.module, format: 'es' }
  ],
  globals: {
    backbone: 'Backbone'
  },
  external: [
    'backbone'
  ]
}
