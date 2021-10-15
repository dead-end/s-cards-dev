/**
 * The function returns a formated date value or an empty string if the date is
 * not defined.
 *
 * @param {Date} date
 * @returns A string with the formated date.
 */
export function fmtDate(date) {
  if (!date) {
    return '';
  }

  const d = new Date();
  d.setTime(date);

  const day = d.getDate() > 9 ? d.getDate() : '0' + d.getDate();
  const month = d.getMonth() > 9 ? d.getMonth() : '0' + d.getMonth();
  const hour = d.getHours() > 9 ? d.getHours() : '0' + d.getHours();
  const minute = d.getMinutes() > 9 ? d.getMinutes() : '0' + d.getMinutes();

  return `${day}.${month}.${d.getFullYear()} ${hour}:${minute}`;
}

/**
 * The function is called with an array of objects. Each object should have
 * property named 'prop'. The function returns a map of the objects and the
 * key is the property.
 *
 * @param {Array} arr Array of objects.
 * @param {String} prop The name of a unique property of the objects.
 * @returns A map of objects with the key 'prop'.
 */
export const arrToMap = (arr, prop) => {
  const map = new Map();
  arr.forEach((elem) => {
    map.set(elem[prop], elem);
  });
  return map;
};

/**
 * The function is called with an array of objects. Each object should have
 * the property 'prop'. The funtion returns an array with that property.
 *
 * @param {Array} arr Array of objects.
 * @param {String} prop The name of a unique property of the objects.
 * @returns An array with the properties.
 */
export const arrGetProps = (arr, prop) => {
  return arr.map((a) => {
    return a[prop];
  });
};

/**
 * The function is called with an array of integers. Each can have a max value.
 * The function computes a percentage string from the values. 100% means that
 * all entries have the max value.
 *
 * @param {Array} arr An array of integers.
 * @param {Number} max The integer value that is 100%.
 * @returns The function returns a string with the percent value.
 */
export const arrPercentage = (arr, max) => {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }

  const result = (sum * 100) / (arr.length * max);
  return result.toFixed(0) + '%';
};

/**
 * The function is called with an array and a value. The function checks if all
 * of the array values have the given value.
 *
 * @param {Array} arr The array with values.
 * @param {Number} val The expected value.
 * @returns True or false.
 */
export const arrAll = (arr, val) => {
  for (let i in arr) {
    if (arr[i] !== val) {
      return false;
    }
  }
  return true;
};
