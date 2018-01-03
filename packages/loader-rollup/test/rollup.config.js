import buble from 'rollup-plugin-buble'

export default {
  sourcemap: true,
  plugins: [
    buble({ transforms: { modules: false } })
  ],
  input: 'test/index.js',
  output: { file: 'tmp/test.js', format: 'cjs' },
  external: ['qunit']
}
