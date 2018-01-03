import { match } from 'tippex'

export const getModuleName = path => {
  const filename = path.split('/').pop()
  const firstDot = filename.indexOf('.')
  return filename.indexOf('.') > -1 ? filename.substr(0, firstDot) : filename
}

export const getModulePath = (path, base) => {
  const isPathAbsolute = path.charAt(0) === '/'

  // Leave the path alone if we don't know the base or if the path is absolute.
  if (!base || isPathAbsolute) return path

  const isBaseAbsolute = base.charAt(0) === '/'

  // Construct the parts of the path
  return path.split('/').reduce((c, v) => {
    if (v === '..') {
      if ((isBaseAbsolute && c.length === 1) || (!isBaseAbsolute && c.length === 0)) {
        // If we can't climb no further than the known base.
        throw new Error('Path has climbed beyond known base path.')
      } else {
        c.pop()
      }
    } else if (v !== '.') {
      c.push(v)
    }

    return c
  }, base.split('/').slice(0, -1)).join('/')
}

export const isComponentPath = path => {
  return /(?:\.ractive)?\.html$/i.test(path)
}

export const isComponentName = name => {
  return /^[a-zA-Z$_][a-zA-Z$_0-9]*$/.test(name)
}

export const trimEnd = string => {
  return string.replace(/[\s\uFEFF\xA0]+$/, '')
}

export const getRequiredModules = string => {
  // We cannot match template strings. Using them would mean something dynamic
  // which we cannot determine when statically scanning the source.
  const pattern = /require\s*\(\s*(?:"([^"]+)"|'([^']+)')\s*\)/g
  const modules = []

  // TODO: While it gets stuff done, tippex is overkill. We need a simpler parser.
  match(string, pattern, (match, doubleQuoted, singleQuoted) => {
    const module = doubleQuoted || singleQuoted
    if (modules.indexOf(module) === -1) modules.push(module)
  })

  return modules.map(m => ({ name: getModuleName(m), module: m }))
}
