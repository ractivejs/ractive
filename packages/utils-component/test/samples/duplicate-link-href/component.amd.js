define(['require','@ractivejs/core','./path/to/MyComponent.ractive.html','./path/to/MyComponent.ractive.html','./path/to/MyComponent.ractive.html'], function(require, Ractive){
var component = {exports:{}}
component.exports.components = {MyComponent:require('./path/to/MyComponent.ractive.html'),MyOtherComponent:require('./path/to/MyComponent.ractive.html'),YetAnotherComponent:require('./path/to/MyComponent.ractive.html')}
return Ractive.extend(component.exports)
})
