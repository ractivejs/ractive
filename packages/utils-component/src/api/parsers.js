import Ractive from '@ractivejs/core'
import {trimEnd, getModuleName, isComponentPath, isComponentName, getRequiredModules} from './strings'

const containerElements = {
  template: true,
  style: true,
  script: true
}

const containerPatterns = {
  template: /(<template[\s\S]*?>)([\s\S]*?)(<\/template>)/i,
  style: /(<style[\s\S]*?>)([\s\S]*?)(<\/style>)/i,
  script: /(<script[\s\S]*?>)([\s\S]*?)(<\/script>)/i
}

const isElement = i => i && i.t === 7
const isLinkedComponent = i => isElement(i) && i.e === 'link' && getAttribute('rel', i) === 'ractive'
const isContainerElement = i => isElement(i) && containerElements[i.e]
const isWhitespace = i => i === ' '

const getAttribute = (name, node) => {
  return node.a && node.a[name] ? node.a[name]
    : node.m ? (node.m.find(a => a.t === 13 && a.n === name) || {}).f
      : undefined
}

export function toParts (module, source) {
  const parts = {
    module: module,
    dependencies: [],
    template: null,
    style: null,
    script: null
  }

  let remainingContent = trimEnd(source)

  // Extract top-level elements
  // TODO: While Ractive.parse gets stuff done, it's overkill. We need a simpler parser.
  Ractive.parse(source, { includeLinePositions: true }).t.reverse().forEach(item => {
    if (isLinkedComponent(item)) {
      // <link rel="ractive">

      const itemOffset = item.p[2]

      const module = getAttribute('href', item)
      if (!module) throw new Error('Linked components must have the href attribute.')
      if (!isComponentPath(module)) throw new Error('Linked components must either have a .html or .ractive.html extension')

      const name = getAttribute('name', item) || getModuleName(module)
      if (!name) throw new Error('Linked components must have the name attribute.')
      if (!isComponentName(name)) throw new Error(`Cannot use ${name} as component name.`)

      parts.dependencies.unshift({ name, module })
      remainingContent = remainingContent.slice(0, itemOffset)
    } else if (isContainerElement(item)) {
      // <template>, <style> or <script>

      const elementName = item.e

      if (parts[elementName]) throw new Error(`There can only be one top-level <${elementName}>.`)

      const itemOffset = item.p[2]
      const itemSection = remainingContent.slice(itemOffset)
      const itemParts = itemSection.match(containerPatterns[elementName])

      parts[elementName] = { code: itemParts[2], map: null }
      remainingContent = remainingContent.slice(0, itemOffset)
    } else if (isWhitespace(item)) {
      // Whitespace

      remainingContent = trimEnd(remainingContent)
    } else {
      throw new Error(`Unexpected top-level element ${item}.`)
    }
  })

  // Extract all require calls and add them to dependencies.
  // The trailing `;` is due to a Buble bug https://github.com/Rich-Harris/buble/issues/87
  const requiredDependencies = parts.script && parts.script.code ? getRequiredModules(parts.script.code) : [];
  parts.dependencies.push(...requiredDependencies)

  return parts
}
