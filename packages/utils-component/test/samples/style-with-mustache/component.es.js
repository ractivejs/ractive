import Ractive from '@ractivejs/core'
var component = {exports:{}}
component.exports.css = "\n  div {\n    content: '{{uninterpolated}}'\n  }\n"
export default Ractive.extend(component.exports)
