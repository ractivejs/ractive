import Ractive from '@ractivejs/core'
import serialize from 'serialize-javascript'
import { isComponent } from './utils'
import { getSourceMap, offsetMapStart } from './source-map'

const getComponents = dependencies => dependencies.filter(d => isComponent(d.module))
const getComponentsInit = components => `component.exports.components = {${components.map(c => `${c.name}:require('${c.module}')`).join(',')}}`
const getTemplateInit = code => `component.exports.template = ${serialize(Ractive.parse(code))}`
const getStyleInit = code => `component.exports.css = ${serialize(code)}`
const getScriptInit = code => code

const getInit = parts => {
  const components = getComponents(parts.dependencies)
  const sections = []

  if (parts.script) sections.push(getScriptInit(parts.script.code))
  if (components.length) sections.push(getComponentsInit(components))
  if (parts.template) sections.push(getTemplateInit(parts.template.code))
  if (parts.style) sections.push(getStyleInit(parts.style.code))

  return sections
}

const getMap = (component, module, script, lineOffset) => {
  const code = (script && script.code) || ''
  const map = (script && script.map) || getSourceMap(component, module, code)
  const offset = (script && script.code) ? lineOffset : 0
  return offsetMapStart(map, offset)
}

export const toCJS = (module, parts) => {
  const sections = [
    `var Ractive = require('@ractivejs/core')`,
    `var component = {exports:{}}`,
    ...getInit(parts),
    `module.exports = Ractive.extend(component.exports)`
  ]

  const code = `${sections.join('\n')}\n`
  const map = getMap(parts.component, module, parts.script, 2)
  return { code, map }
}

export const toAMD = (module, parts) => {
  const dependencies = ['require', '@ractivejs/core', ...parts.dependencies.map(d => d.module)].map(d => `'${d}'`).join(',')

  const sections = [
    `define([${dependencies}], function(require, Ractive){`,
    `var component = {exports:{}}`,
    ...getInit(parts),
    `return Ractive.extend(component.exports)`,
    `})`
  ]

  const code = `${sections.join('\n')}\n`
  const map = getMap(parts.component, module, parts.script, 2)
  return { code, map }
}

export const toES = (module, parts) => {
  const imports = parts.dependencies.map((d, i) => `import __ractiveimport${i}__ from '${d.module}'`)

  const sections = [
    `import Ractive from '@ractivejs/core'`,
    ...imports,
    `var require = (function(d){return function(m){return d[m]}})({${parts.dependencies.map((d, i) => `'${d.module}':__ractiveimport${i}__`).join(',')}})`,
    `var component = {exports:{}}`,
    ...getInit(parts),
    `export default Ractive.extend(component.exports)`
  ]

  const code = `${sections.join('\n')}\n`
  const map = getMap(parts.component, module, parts.script, parts.dependencies.length + 3)
  return { code, map }
}

export const toConstructor = (module, parts, resolver) => {
  const components = getComponents(parts.dependencies)
  const component = { exports: {} }

  if (parts.script) (new Function('require', 'exports', 'component', 'Ractive', parts.script.code))(resolver, component.exports, component, Ractive)
  if (components.length) component.exports.components = components.reduce((p, c) => { p[c.name] = resolver(c.module); return p }, {})
  if (parts.template) component.exports.template = Ractive.parse(parts.template.code)
  if (parts.style) component.exports.css = parts.style.code

  return Ractive.extend(component.exports)
}
