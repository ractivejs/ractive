define(['require','@ractivejs/core'], function(require, Ractive){
var component = {exports:{}}

  component.exports = {
    oninit () {
      console.log('{{uninterpolated}}')
    }
  }

return Ractive.extend(component.exports)
})
