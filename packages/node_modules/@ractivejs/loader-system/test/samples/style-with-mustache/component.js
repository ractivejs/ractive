var Ractive = require('@ractivejs/core')
var component = {exports:{}}
component.exports.css = "\n  div {\n    content: '{{uninterpolated}}'\n  }\n"
module.exports = Ractive.extend(component.exports)
