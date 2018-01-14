import Ractive from '@ractivejs/core'
import __ractiveimport0__ from './path/to/MyComponent.ractive.html'
import __ractiveimport1__ from './path/to/MyComponent.ractive.html'
import __ractiveimport2__ from './path/to/MyComponent.ractive.html'
var require = (function(d){return function(m){return d[m]}})({'./path/to/MyComponent.ractive.html':__ractiveimport0__,'./path/to/MyComponent.ractive.html':__ractiveimport1__,'./path/to/MyComponent.ractive.html':__ractiveimport2__})
var component = {exports:{}}
component.exports.components = {MyComponent:require('./path/to/MyComponent.ractive.html'),MyOtherComponent:require('./path/to/MyComponent.ractive.html'),YetAnotherComponent:require('./path/to/MyComponent.ractive.html')}
export default Ractive.extend(component.exports)
