define(function(require, exports, module){
var Ractive = require('@ractivejs/core')
var __component0__ = require('./path/to/MyComponent.ractive.html')
var __component1__ = require('./path/to/MyOtherComponent.ractive.html')
var __component2__ = require('./path/to/YetAnotherComponent.ractive.html')
var component = {exports: {}}
component.exports.components = {MyComponent: __component0__, MyComponent: __component1__, MyComponent: __component2__}
module.exports = Ractive.extend(component.exports)
})
