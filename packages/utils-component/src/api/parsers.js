import { getComponentName, isComponent, isComponentName, getRequiredModules } from './utils'

const linkPattern = /^<link((?:\s+[-a-z:]+(?:="(?:\\.|[^"])*")?)*)\s*(\/?)>/i
const containerPattern = /^<(template|style|script)((?:\s+[-a-z:]+(?:="(?:\\.|[^"])*")?)*)\s*>([\s\S]*?)<\/\1>/i
const whitespacePattern = /^(\s+?)/
const attributePairsPattern = /[-a-z:]+(?:="((?:\\.|[^"])*)")?/g
const attributeComponentsPattern = /([-a-z:]+)(?:="((?:\\.|[^"])*)")?/

const getAttributes = attributesString => {
  const attributePairs = attributesString.match(attributePairsPattern)
  return attributePairs ? attributePairs.reduce((attributes, attribute) => {
    const match = attribute.match(attributeComponentsPattern)
    if (match) attributes[match[1]] = match[2] === undefined ? '' : match[2]
    return attributes
  }, {}) : {}
}

export function toParts (component, source) {
  const parts = {
    component: component,
    dependencies: [],
    template: null,
    style: null,
    script: null
  }

  // eslint-disable-next-line
  while (source) {
    let match

    // eslint-disable-next-line
    if (match = source.match(linkPattern)) {
      const attributes = getAttributes(match[1].trim())

      const module = attributes.href
      if (!module) throw new Error('Linked components must have the href attribute.')
      if (!isComponent(module)) throw new Error('Linked components must either have a .html or .ractive.html extension')

      const name = attributes.name || getComponentName(module)
      if (!name) throw new Error('Linked components must have the name attribute.')
      if (!isComponentName(name)) throw new Error(`Cannot use ${name} as component name.`)

      parts.dependencies.push({ name, module })

      source = source.slice(match[0].length)
    // eslint-disable-next-line
    } else if (match = source.match(containerPattern)) {
      const elementName = match[1]

      if (parts[elementName]) throw new Error(`There can only be one top-level <${elementName}>.`)

      const code = match[3]
      const map = null

      parts[elementName] = { code, map }

      source = source.slice(match[0].length)
    // eslint-disable-next-line
    } else if (match = source.match(whitespacePattern)) {
      // Strip whitespace from the top level. Not really important.
      source = source.slice(match[0].length)
    } else {
      throw new Error(`Unexpected syntax at ${source.slice(0, 10)}...`)
    }
  }

  // Extract all require calls and add them to dependencies.
  // The trailing `;` is due to a Buble bug https://github.com/Rich-Harris/buble/issues/87
  const requiredDependencies = parts.script && parts.script.code ? getRequiredModules(parts.script.code) : [];
  parts.dependencies.push(...requiredDependencies)

  return parts
}
