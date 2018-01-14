/* eslint-env browser */
import { toParts, toConstructor, getComponentPath, isComponent } from '@ractivejs/utils-component'

// We need to avoid re-evaluating already-loaded dependencies, hence the cache.
const resolvedDependencies = {}

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
// It's not a question of getComponentPath's implementation, but a question of what
// is the base for the module to be resolved.
const resolveModulePath = (m, d, b) => getComponentPath(m, m.charAt(0) === '.' ? d : b)

const load = (basePath, dependentPath, modulePath, dependencyMap) => {
  // Determine if module is relative to base or dependent
  const resolvedModulePath = resolveModulePath(modulePath, dependentPath, basePath)

  // Resolve require calls inside the evaluated code.
  const dependencyResolver = module => {
    const modulePath = resolveModulePath(module, dependentPath, basePath)
    const resolvedDependency = isComponent(modulePath) ? resolvedDependencies[modulePath] : null
    const dependency = resolvedDependency || dependencyMap[module] || window[module]

    if (!dependency) throw new Error(`Could not find dependency ${dependency}`)

    return dependency
  }

  return get(resolvedModulePath).then(source => {
    const parts = toParts(resolvedModulePath, source)

    // Create and cache the evaluated constructor.
    const getConstructor = () => {
      // getConstructor doesn't care what the promise resolves to. If it worked,
      // the dependencies should be in the resolvedDependencies pile.
      const constructor = toConstructor(resolvedModulePath, parts, dependencyResolver)
      resolvedDependencies[resolvedModulePath] = constructor
      return constructor
    }

    // Recursively load subcomponents
    const loadDependencies = dependencies => dependencies
      .filter(d => isComponent(d.module) && !resolvedDependencies[d.module])
      .map(d => load(basePath, resolvedModulePath, d.module, dependencyMap))

    const dependenciesPromise = parts.dependencies ? Promise.all(loadDependencies(parts.dependencies)) : Promise.resolve()

    return dependenciesPromise.then(getConstructor)
  })
}

export const loadComponent = (base, module, dependencyMap) => {
  return load(base, base, module, dependencyMap)
}

export const loadComponents = (base, modules, dependencyMap) => {
  return Promise.all(modules.map(module => load(base, base, module, dependencyMap)))
}
