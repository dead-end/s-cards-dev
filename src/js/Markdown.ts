/**
 * The pattern for the text decoration.
 */
const replacers = [
  {
    pattern: new RegExp(/_([^_]+)_/, 'g'),
    replace: '<u>$1</u>'
  },
  {
    pattern: new RegExp(/\*([^*]+)\*/, 'g'),
    replace: '<b>$1</b>'
  },
  {
    pattern: new RegExp(/~([^~]+)~/, 'g'),
    replace: '<i>$1</i>'
  },
]

/**
 * The pattern to remove the text decoration.
 */
const removePattern = new RegExp(/[_*~]/, 'g')

/**
 * The function replaces the text decoration with html. It only replaces
 * balanced decorators.
 */
const mdReplace = (line: string) => {

  replacers.forEach(replacer => {
    line = line.replaceAll(replacer.pattern, replacer.replace)
  })

  return line
}

/**
 * The function removes the formatting for searching.
 */
export const mdRemove = (str: string) => {
  return str.replace(removePattern, '')
}

/**
 * The function replaces the markdown with html
 */
export const mdToHtml = (lines: string | string[]) => {
  if (!Array.isArray(lines)) {
    lines = [lines]
  }

  let inside = false

  let result = ''

  for (const line of lines) {
    if (line.startsWith('- ')) {
      if (!inside) {
        result += '<ul>'
        inside = true
      }

      result += '<li>' + mdReplace(line.substring(2).trim()) + '</li>'
      continue
    }

    if (inside) {
      result += '</ul>'
      inside = false
    } else if (result !== '') {
      result += '<br />'
    }

    result += mdReplace(line.trim())
  }

  //
  // If the array ends with list, we need the closing tag.
  //
  if (inside) {
    result += '</ul>'
  }

  return result
}