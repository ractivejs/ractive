import Ractive from '@ractivejs/core'
var component = {exports:{}}

  function require(foo00){}

  /*
   * const foo01 = require('foo01')
   * const foo02 = require("foo02")
   */

  // const foo03 = require('foo03')
  // const foo04 = require("foo04")

  const foo05 = /require('foo05')/
  const foo06 = /require("foo06")/

  const foo07 = 'require(\'foo07\')'
  const foo08 = 'require("foo08")'

  const foo09 = "require('foo09')"
  const foo10 = "require(\"foo10\")"

  const foo11 = { require(foo11){} }
  const foo12 = function require(foo12){}

  const foo13 = foo11.require('foo13')
  const foo14 = foo11.require("foo14")

export default Ractive.extend(component.exports)
