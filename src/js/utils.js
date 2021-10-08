/**
 *
 * @param {*} arr
 * @param {*} prop
 * @returns
 */
export const arrGetProps = (arr, prop) => {
  return arr.map((a) => {
    return a[prop];
  });
};

export const arrToMap = (arr, prop) => {
  const map = new Map();
  arr.forEach((elem) => {
    map.set(elem[prop], elem);
  });
  return map;
};
