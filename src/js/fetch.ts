// TODO: remove catch from Promise and use try / catch on calling the functions.

/**
 * The function fetches an url with json data and returns a Promise for that
 * json data.
 */
export const fetchJson = (url: string) => {
  return fetch(url)
    .then((response) => response.json())
    .catch((e) => console.error(e));
};

/**
 * The function calls an url with a HEAD request and returns the last modified
 * value as a Date instance.
 */
export const fetchLastModified = (url: string) => {
  return fetch(url, { method: 'HEAD' })
    .then((response) => {
      //
      // Get the last modified from the response.
      //
      const lastModified = response.headers.get('Last-Modified');
      console.log('url: ', url, ' header: ', lastModified);

      //
      // Ensure that the header exists.
      //
      if (lastModified) {
        return new Date(lastModified);
      }
    })
    .catch((e) => console.error(e));
};