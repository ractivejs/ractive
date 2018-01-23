import Ractive from '@ractivejs/core'
import __ractiveimport0__ from './path/to/MyComponent.ractive.html'
import __ractiveimport1__ from './path/to/MyOtherComponent.ractive.html'
import __ractiveimport2__ from './path/to/YetAnotherComponent.ractive.html'
import __ractiveimport3__ from 'hhgttg'
var require = (function(d){return function(m){return d[m]}})({'./path/to/MyComponent.ractive.html':__ractiveimport0__,'./path/to/MyOtherComponent.ractive.html':__ractiveimport1__,'./path/to/YetAnotherComponent.ractive.html':__ractiveimport2__,'hhgttg':__ractiveimport3__})
var component = {exports:{}}

  const answer = require('hhgttg')

  component.exports = {
    data: {
      user: 'World',
      answer: answer
    }
  }

component.exports.components = {MyComponent:require('./path/to/MyComponent.ractive.html'),MyOtherComponent:require('./path/to/MyOtherComponent.ractive.html'),YetAnotherComponent:require('./path/to/YetAnotherComponent.ractive.html')}
component.exports.template = {"v":4,"t":[{"t":7,"e":"div","f":["Hello, ",{"t":2,"r":"user"},"!"]}," ",{"t":7,"e":"div","f":["Answer to the Ultimate Question of Life, the Universe, and Everything: ",{"t":2,"r":"answer"}]}," ",{"t":7,"e":"div","f":["Expression ",{"t":2,"x":{"r":["a","b"],"s":"_0+_1"}}]}," ",{"t":7,"e":"MyComponent"}," ",{"t":7,"e":"MyOtherComponent"}," ",{"t":7,"e":"YetAnotherComponent"}],"e":{"_0+_1":function (_0,_1){return(_0+_1);}}}
component.exports.css = "\n  div {\n    color: red\n  }\n"
export default Ractive.extend(component.exports)
