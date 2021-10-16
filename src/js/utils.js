/**
 * The function returns a formated date value or an empty string if the date is
 * not defined.
 *
 * @param {Date} date The date to be formatted.
 * @returns A string with the formatted date.
 */
export function fmtDate(date) {
  //
  // Handle empty dates.
  //
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
 * @param {string} prop The name of a unique property of the objects.
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
 * @param {Array<Object>} arr Array of objects.
 * @param {string} prop The name of a unique property of the objects.
 * @returns An array with the properties.
 */
// TODO: necessary??
// arr.map((a) => a[prop])
export const arrGetProps = (arr, prop) => {
  return arr.map((a) => {
    return a[prop];
  });
};

/**
 * The function is called with an array and a value. The function checks if all
 * of the array values have the given value.
 *
 * @param {Array<number>} arr The array with values.
 * @param {number} val The expected value.
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

/**
 * The function is called with an array of integers. Each can have a max value.
 * The function computes a percentage string from the values. 100% means that
 * all entries have the max value.
 *
 * @param {Array<number>} arr An array of integers.
 * @param {number} max The integer value that is 100%.
 * @returns The function returns a string with the percent value.
 */
export const arrPercentage = (arr, max) => {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }

  return percentage(sum, arr.length * max);
};

/**
 * The function returns a percentage for a fraction of a total value.
 *
 * @param {number} num The fraction of the total value.
 * @param {number} total The integer value that is 100%.
 * @returns The function returns a string with the percent value.
 */
export const percentage = (num, total) => {
  const result = (num * 100) / total;
  return result.toFixed(0) + '%';
};

/**
 * The function returns a random number between min and max. Both are included
 * and it is assumed that both parameters are integers.
 *
 * @param {number} min The minimum value, included.
 * @param {number} max The maximum value,  included.
 * @returns a random number
 */
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * The function shuffles an array in place.
 *
 * @param {Array<any>} arr The array to shuffle.
 */
export function shuffleArr(arr) {
  for (let i = 0; i < arr.length; i++) {
    //
    // Get a random index of the array
    //
    let j = getRandomIntInclusive(0, arr.length - 1);

    //
    // Ensure that there is something to do
    //
    if (i === j) {
      continue;
    }

    //
    // Swap i and j
    //
    let tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}
