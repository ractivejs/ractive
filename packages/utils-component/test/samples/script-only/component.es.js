import Ractive from '@ractivejs/core'
var component = {exports: {}}

  const answer = require('hhgttg')

  component.exports = {
    data: {
      user: 'World',
      answer: answer
    }
  }

export default Ractive.extend(component.exports)
