define(['@ractivejs/core', 'external-module'], function (Ractive, __ractiveimport1__) { 'use strict';

Ractive = Ractive && Ractive.hasOwnProperty('default') ? Ractive['default'] : Ractive;
__ractiveimport1__ = __ractiveimport1__ && __ractiveimport1__.hasOwnProperty('default') ? __ractiveimport1__['default'] : __ractiveimport1__;

var component$1 = {exports:{}};
component$1.exports.template = {"v":4,"t":[{"t":7,"e":"div","m":[{"n":"class","f":"my-component","t":13}],"f":["My Component"]}]};
var __ractiveimport0__ = Ractive.extend(component$1.exports);

const answer = 42;

var require = (function(d){return function(m){return d[m]}})({'./path/to/MyComponent.ractive.html':__ractiveimport0__,'external-module':__ractiveimport1__,'./bundled-module':answer});
var component = {exports:{}};

  const external = require('external-module');
  const bundled = require('./bundled-module');

  component.exports = {
    data: {
      message: 'World',
      external: external,
      bundled: bundled
    }
  };

component.exports.components = {MyComponent:require('./path/to/MyComponent.ractive.html')};
component.exports.template = {"v":4,"t":[{"t":7,"e":"div","f":["Hello, ",{"t":2,"r":"message"},"!"]}," ",{"t":7,"e":"div","f":["Answer to the Ultimate Question of Life, the Universe, and Everything: ",{"t":2,"r":"answer"}]}," ",{"t":7,"e":"MyComponent"}]};
component.exports.css = "\n  div {\n    color: red\n  }\n";
var Component = Ractive.extend(component.exports);

Component();

});
