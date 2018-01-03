import { toParts, toES } from '@ractivejs/utils-compile'

export default function (options) {
  return {
    name: '@ractivejs/loader-rollup',
    transform: (source, id) => {
      if (!/\.ractive\.html$/i.test(id)) return null
      const { code } = toES(id, toParts(id, source))
      return code
    }
  }
}
