var Ractive = require('@ractivejs/core')
var component = {exports:{}}

  const answer = require('hhgttg')

  component.exports = {
    data: {
      user: 'World',
      answer: answer
    }
  }

module.exports = Ractive.extend(component.exports)
