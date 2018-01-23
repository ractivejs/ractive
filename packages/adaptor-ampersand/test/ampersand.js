// Despite Ampersand claiming that it can be bundled correctly by other
// bundlers, it's only bundled correctly using Browserify because transitive
// dependencies rely on node-specific things.
//
// ...so we bundle it using Browserify to get rid of the Node-specific things,
// then hand it off to Rollup.
module.exports = {
  Model: require('ampersand-model'),
  Collection: require('ampersand-collection')
}
