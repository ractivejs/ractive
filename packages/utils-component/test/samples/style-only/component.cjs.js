var Ractive = require('@ractivejs/core')
var component = {exports:{}}
component.exports.css = "\n  div {\n    color: red\n  }\n"
module.exports = Ractive.extend(component.exports)
