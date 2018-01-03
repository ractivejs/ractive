var Ractive = require('@ractivejs/core')
var __component0__ = require('./path/to/MyComponent.ractive.html')
var __component1__ = require('./path/to/MyComponent.ractive.html')
var __component2__ = require('./path/to/MyComponent.ractive.html')
var component = {exports: {}}
component.exports.components = {MyComponent: __component0__, MyOtherComponent: __component1__, YetAnotherComponent: __component2__}
module.exports = Ractive.extend(component.exports)
