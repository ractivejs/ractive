import pkg from '../package.json'
import buble from 'rollup-plugin-buble'

export default {
  sourcemap: true,
  plugins: [
    buble({transforms: { modules: false }})
  ],
  input: 'test/index.js',
  output: { file: 'tmp/test.js', format: 'iife', name: pkg.name }
}
