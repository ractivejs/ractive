define(['require','@ractivejs/core','hhgttg'], function(require, Ractive){
var component = {exports:{}}

  const answer = require('hhgttg')

  component.exports = {
    data: {
      user: 'World',
      answer: answer
    }
  }

return Ractive.extend(component.exports)
})
