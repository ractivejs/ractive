import serialize from 'serialize-javascript'
import Ractive from '@ractivejs/core'
import { getSourceMap, offsetMapStart } from './source-map'
import { isComponentPath } from './strings'

const esPrefix = `import Ractive from '@ractivejs/core'`
const esImporter = (n, m) => `import ${n} from '${m}'`
const esPostfix = `export default Ractive.extend(component.exports)`

const cjsPrefix = `var Ractive = require('@ractivejs/core')`
const cjsImporter = (n, m) => `var ${n} = require('${m}')`
const cjsPostfix = `module.exports = Ractive.extend(component.exports)`

const amdWrap = m => `define(function(require, exports, module){\n${m}})\n`

export const getComponentDependencies = dependencies => dependencies.filter(d => isComponentPath(d.module))
export const getComponentImporters = (components, importer) => components.map((c, i) => importer(`__component${i}__`, c.module)).join('\n')
export const getComponentRegistrations = components => `component.exports.components = {${components.map((c, i) => `${c.name}: __component${i}__`).join(', ')}}`
export const getTemplate = template => `component.exports.template = ${serialize(Ractive.parse(template.code))}`
export const getStyle = style => `component.exports.css = ${serialize(style.code)}`
export const getScript = script => script.code

// Wraps code with Ractive-specific augmentations.
const getCode = (parts, prefix, postfix, importer) => {
  const code = []
  const components = getComponentDependencies(parts.dependencies)

  if (prefix) code.push(prefix)
  if (components.length) code.push(getComponentImporters(components, importer))
  code.push(`var component = {exports: {}}`)
  if (parts.script) code.push(getScript(parts.script))
  if (components.length) code.push(getComponentRegistrations(components))
  if (parts.template) code.push(getTemplate(parts.template))
  if (parts.style) code.push(getStyle(parts.style))
  if (postfix) code.push(postfix)
  return `${code.join('\n')}\n`
}

const getMap = (module, parts, additionalOffset) => {
  const code = (parts.script && parts.script.code) || ''

  // If a map exists, a third-party tool probably supplied it.
  // If a map doesn't exist, we're consuming a toParts output directly.
  const map = (parts.script && parts.script.map) || getSourceMap(parts.module, module, code)

  // For Ractive import and component.exports setup.
  const prefixOffset = 2
  const importOffset = getComponentDependencies(parts.dependencies).length

  // Padding is needed to compensate for the wrapper code.
  // Do not offset if there's no code.
  return parts.script && parts.script.code ? offsetMapStart(map, prefixOffset + importOffset + additionalOffset) : map
}

// Generates a CJS module of the component.
export const toCJS = (module, parts) => ({
  code: getCode(parts, cjsPrefix, cjsPostfix, cjsImporter),
  map: getMap(module, parts, 0)
})

// Generates an AMD module of the component.
export const toAMD = (module, parts) => ({
  code: amdWrap(getCode(parts, cjsPrefix, cjsPostfix, cjsImporter)),
  map: getMap(module, parts, 1)
})

// Generates an ES module of the component.
export const toES = (module, parts) => ({
  code: getCode(parts, esPrefix, esPostfix, esImporter),
  map: getMap(module, parts, 0)
})

// Generates a live constructor of the component.
export const toConstructor = (module, parts, resolver) => {
  const components = getComponentDependencies(parts.dependencies)
  const component = { exports: {} }

  if (parts.script) (new Function('require', 'exports', 'component', 'Ractive', parts.script.code))(resolver, component.exports, component, Ractive)
  if (components.length) component.exports.components = components.reduce((p, c) => { p[c.name] = resolver(c.module); return p }, {})
  if (parts.template) component.exports.template = Ractive.parse(parts.template.code)
  if (parts.style) component.exports.css = parts.style.code

  return Ractive.extend(component.exports)
}
