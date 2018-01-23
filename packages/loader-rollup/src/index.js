import { toParts, toES, isComponent } from '@ractivejs/utils-component'

export default function (options) {
  return {
    name: '@ractivejs/loader-rollup',
    transform: (source, id) => {
      if (!isComponent(id)) return null
      return toES(id, toParts(id, source))
    }
  }
}
