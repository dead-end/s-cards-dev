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
