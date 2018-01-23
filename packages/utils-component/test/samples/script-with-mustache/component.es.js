import Ractive from '@ractivejs/core'
var component = {exports:{}}

  component.exports = {
    oninit () {
      console.log('{{uninterpolated}}')
    }
  }

export default Ractive.extend(component.exports)
