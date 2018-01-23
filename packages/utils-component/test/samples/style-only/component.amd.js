define(['require','@ractivejs/core'], function(require, Ractive){
var component = {exports:{}}
component.exports.css = "\n  div {\n    color: red\n  }\n"
return Ractive.extend(component.exports)
})
