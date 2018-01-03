import Ractive from '@ractivejs/core'
import __component0__ from './path/to/MyComponent.ractive.html'
import __component1__ from './path/to/MyOtherComponent.ractive.html'
import __component2__ from './path/to/YetAnotherComponent.ractive.html'
var component = {exports: {}}
component.exports.components = {MyComponent: __component0__, MyComponent: __component1__, MyComponent: __component2__}
export default Ractive.extend(component.exports)
