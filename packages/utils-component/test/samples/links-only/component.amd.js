define(['require','@ractivejs/core','./path/to/MyComponent.ractive.html','./path/to/MyOtherComponent.ractive.html','./path/to/YetAnotherComponent.ractive.html'], function(require, Ractive){
var component = {exports:{}}
component.exports.components = {MyComponent:require('./path/to/MyComponent.ractive.html'),MyOtherComponent:require('./path/to/MyOtherComponent.ractive.html'),YetAnotherComponent:require('./path/to/YetAnotherComponent.ractive.html')}
return Ractive.extend(component.exports)
})
