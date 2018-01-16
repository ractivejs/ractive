/* eslint-env browser */
import { toParts, toConstructor, getComponentPath, isComponent } from '@ractivejs/utils-component'

// Two caches are needed:
// - For pending requests, to reuse pending calls instead of issuing multiple to the same resource.
// - For the evaluated constructors, to reuse already evaluated components.
const pending = {}
const constructors = {}

// Fetch is too new for IE. However, Ractive polyfills Promise, so we're good.
const get = url => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest()
  xhr.onload = () => resolve(xhr.responseText)
  xhr.onerror = reject
  xhr.open('GET', url)
  xhr.send()
})

// A module can be relative in 3 ways:
// - Relative to dependent, if it starts with ./ or ../ (i.e. ./path/to/dependency).
// - Relative to base, if it starts with a segment (i.e. path/to/dependency).
// - Relative to domain, if it starts with / (i.e. /path/to/dependency).
const resolveModulePath = (m, d, b) => getComponentPath(m, m.charAt(0) === '.' ? d : b)

const load = (basePath, dependentPath, componentPath, dependencyMap) => {
  const resolvedComponentPath = resolveModulePath(componentPath, dependentPath, basePath)

  const dependencyResolver = module => {
    const modulePath = resolveModulePath(module, dependentPath, basePath)
    // Resolve from the map and global. Components check the constructor cache first.
    return (isComponent(modulePath) && constructors[modulePath]) || dependencyMap[module] || window[module]
  }

  return pending[resolvedComponentPath] || (pending[resolvedComponentPath] = get(resolvedComponentPath).then(source => {
    const parts = toParts(resolvedComponentPath, source)

    // Recursively load ONLY subcomponents. Other deps load either from the map or global.
    const loadDependencies = dependencies => dependencies.filter(d => isComponent(d.module)).map(d => load(basePath, resolvedComponentPath, d.module, dependencyMap))

    // Cache the built constructor for dependencyResolver access.
    const createConstructor = () => (constructors[resolvedComponentPath] = toConstructor(resolvedComponentPath, parts, dependencyResolver))

    // Only built the constructor when all subcomponents resolve.
    return Promise.all(loadDependencies(parts.dependencies)).then(createConstructor)
  }))
}

export const loadComponent = (base, module, dependencyMap) => load(base, base, module, dependencyMap)
export const loadComponents = (base, modules, dependencyMap) => Promise.all(modules.map(module => load(base, base, module, dependencyMap)))
