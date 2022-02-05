import { errorStore } from '../stores/errorStore'

/**
 * The function fetches an url with json data and returns a Promise for that
 * json data.
 * 
 * If the function call fails the it returns 'undefined'
 */
export const fetchJson = (url: string) => {
  return fetch(url)
    .then((response) => {

      //
      // Ensure that the request is ok.
      //
      if (!response.ok) {
        throw Error(`Unable to get JSON: ${url} - ${response.statusText}`)
      }

      return response.json()
    }).catch((e) => errorStore.addError(`fetchJson - url: ${url} error: ${e}`))
}

/**
 * The function sends a HEAD request to the server and returns a hash value, in
 * this case simply the size of the file. If the hash has changed, the file has
 * to be reloaded.
 * 
 * The lastmodified or etag cannot be used. They seam to change on every commit
 * to the repository.
 * 
 * If the function call fails the it returns 'undefined'
 */
export const fetchHash = (url: string) => {
  return fetch(url, { method: 'HEAD' })
    .then((response) => {

      //
      // Ensure that the request is ok.
      //
      if (!response.ok) {
        throw Error(`Unable to get hash for: ${url} - ${response.statusText}`)
      }

      //
      // Get the hash value from the response.
      //
      const hash = response.headers.get('Content-Length')
      console.log('url: ', url, 'header:', hash)

      return hash
    }).catch((e) => errorStore.addError(`fetchHash - url: ${url} error: ${e}`))
}