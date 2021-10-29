// TODO: remove catch from Promise and use try / catch on calling the functions.

/**
 * The function fetches an url with json data and returns a Promise for that
 * json data.
 *
 * @param {String} url The url to fetch.
 * @returns A promise for the json data.
 */
export const fetchJson = (url) => {
  return fetch(url)
    .then((response) => response.json())
    .catch((e) => console.error(e));
};

/**
 * The funciton call an url with a HEAD request an returns the last modified
 * value as a Date instance.
 *
 * @param {String} url The url to fetch.
 * @returns A promise for the last modified Date
 */
export const fetchLastModified = (url) => {
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
