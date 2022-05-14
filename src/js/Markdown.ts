import { errorStore } from '../stores/errorStore';

/*******************************************************************************
 * The class defines the mapping of a char (example: *) to a tag (example: <b>).
 * To produce valid html it has to return <b> and </b> pairwise. The check
 * function ensures that the result is balanced.
 ******************************************************************************/
class Mapping {
  md: string
  tag: string
  count = 0

  constructor(md: string, tag: string) {
    this.md = md
    this.tag = tag
  }

  getTag() {
    return ++this.count % 2 ? `<${this.tag}>` : `</${this.tag}>`
  }

  check(lines: string[]) {
    if (this.count % 2) {
      errorStore.addError(`Unbalanced tag: ${this.md} count: ${this.count} data: ${lines}`)
    }

    this.count = 0
  }
}

/*******************************************************************************
 * The class implements a simple markdown generator. It is called with an array
 * of strings and produces an html fragment. It allows lists:
 *
 * - list item
 * - list item
 *
 * *bold* text
 * ~italic~ text
 * _underline_ text
 ******************************************************************************/

export default class Markdown {
  map: Record<string, Mapping> = {}
  regex: RegExp

  constructor() {

    this._register('_', 'u')
    this._register('*', 'b')
    this._register('~', 'i')

    this.regex = this._pattern()
  }

  _register(chr: string, tag: string) {
    this.map[chr] = new Mapping(chr, tag)
  }

  _pattern() {
    let result = ''
    for (const m in this.map) {
      result += m
    }

    return new RegExp(`[${result}]`, 'g')
  }

  tag(chr: string) {
    if (!(chr in this.map)) {
      errorStore.throwError(`Unknown element: ${chr}`)
    }

    return this.map[chr].getTag()
  }

  _check(lines: string[]) {
    for (const m in this.map) {
      this.map[m].check(lines)
    }
  }

  _substitute(line: string) {
    return line.replaceAll(this.regex, (elem) => {
      return this.tag(elem)
    })
  }

  /****************************************************************************
   * The function is called with a line or an array of lines containing
   * markdown. It return the processed html.
   ***************************************************************************/

  toHtml(lines: string | string[]) {
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

        result += '<li>' + this._substitute(line.substring(2).trim()) + '</li>'
        continue
      }

      if (inside) {
        result += '</ul>'
        inside = false
      } else if (result !== '') {
        result += '<br />'
      }

      result += this._substitute(line.trim())
    }

    //
    // If the array ends with list, we need the closing tag.
    //
    if (inside) {
      result += '</ul>'
    }

    //
    // ensure that all is balanced
    //
    this._check(lines)

    return result
  }
}
