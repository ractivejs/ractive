var Ractive = require('@ractivejs/core')
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
module.exports = Ractive.extend(component.exports)
