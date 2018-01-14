const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
const toBase64 = typeof btoa === 'function' ? btoa : str => Buffer.from(str).toString('base64')

const encodeNumber = (num, result = '') => {
  const pentad = num & 31
  const remain = num >> 5
  const hexad = remain > 0 ? pentad | 32 : pentad
  const concat = `${result}${chars.charAt(hexad)}`
  return remain > 0 ? encodeNumber(remain, concat) : concat
}

// Encodes mapping fields (output column, source index, source line, source column)
const encodeFields = fields => fields.map(num => encodeNumber(num < 0 ? (-num << 1) | 1 : num << 1)).join('')

// Creates a 1:1 source map.
export const getSourceMap = (inputFileName, outputFileName, source = '') => ({
  version: 3,
  file: outputFileName,
  sources: [inputFileName],
  // If source is falsy, it returns blank for both sourceContent and mappings.
  sourcesContent: [source],
  mappings: source ? source.split('\n').map((line, i, a) => {
    const isFirstLine = i === 0

    // The very first column of the first line is 0 as a base value.
    // The first column of the rest of the lines is 0 as an offset.
    const sourceLineOffset = isFirstLine ? 0 : 1
    const sourceColumnOffset = isFirstLine ? 0 : -a[i - 1].length

    // All that really matters is the first character's offsets. The remaining
    // mappings just increment the source and output columns by 1.
    const firstCharacter = encodeFields([0, 0, sourceLineOffset, sourceColumnOffset])
    const restOfTheline = new Array(line.length + 1).join(',CAAC')

    return `${firstCharacter}${restOfTheline}`
  }).join(';') : ''
})

// Turns a map generated by getSourceMap into an inline source map
export const getInlineSourceMap = map => {
  const encoded = toBase64(JSON.stringify(map))
  return `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${encoded}`
}

// Prefix an existing source map with empty lines.
export const offsetMapStart = (map, amount) => {
  const padding = amount ? new Array(amount + 1).join(';') : ''
  const mappings = `${padding}${map.mappings}`
  return Object.assign({}, map, { mappings })
}