/**
 * The function fetches a url with json data and calls the callback function on
 * the result.
 *
 * @param {*} url
 * @param {*} func
 */
export const fetchJson = (url, func) => {
  fetch(url)
    .then((response) => response.json())
    .then(func)
    .catch((e) => console.log(e));
};

/**
 *
 * @param {*} url
 * @returns
 */
export const fetchLastModified = (url) => {
  return fetch(url, { method: 'HEAD' })
    .then((response) => {
      const header = response.headers.get('Last-Modified');
      if (header) {
        return new Date(header);
      }
    })
    .catch((e) => console.log(e));
};

export const fetchJson2 = (url) => {
  fetch(url).then((response) => response.json());
};
