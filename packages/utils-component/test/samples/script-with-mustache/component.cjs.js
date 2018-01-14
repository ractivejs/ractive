var Ractive = require('@ractivejs/core')
var component = {exports:{}}

  component.exports = {
    oninit () {
      console.log('{{uninterpolated}}')
    }
  }

module.exports = Ractive.extend(component.exports)
