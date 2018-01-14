var Ractive = require('@ractivejs/core')
var component = {exports:{}}
component.exports.components = {MyComponent:require('./path/to/MyComponent.ractive.html'),MyComponent:require('./path/to/MyOtherComponent.ractive.html'),MyComponent:require('./path/to/YetAnotherComponent.ractive.html')}
module.exports = Ractive.extend(component.exports)
