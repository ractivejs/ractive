define(['require','@ractivejs/core'], function(require, Ractive){
var component = {exports:{}}
component.exports.css = "\n  div {\n    content: '{{uninterpolated}}'\n  }\n"
return Ractive.extend(component.exports)
})
