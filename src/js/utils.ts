import { errorStore } from "../stores/errorStore"

/**
 * The function returns a formated date value or an empty string if the date is
 * not defined.
 */
export const fmtDate = (d: Date | void) => {
  //
  // Handle empty dates.
  //
  if (!d) {
    return ''
  }

  const day = d.getDate() > 9 ? d.getDate() : '0' + d.getDate()
  const m = d.getMonth() + 1
  const month = m > 9 ? m : '0' + m
  const hour = d.getHours() > 9 ? d.getHours() : '0' + d.getHours()
  const minute = d.getMinutes() > 9 ? d.getMinutes() : '0' + d.getMinutes()

  return `${day}.${month}.${d.getFullYear()} ${hour}:${minute}`
}

/**
 * The function checks if two arrays of strings are equal.
 */
export const arrIsEqual = (arr1: string[] | void, arr2: string[] | void) => {
  //
  // Ensure that both exist.
  //
  const a1 = arr1 ? arr1 : []
  const a2 = arr2 ? arr2 : []

  return a1.toString() === a2.toString()
}

/**
 * The function is called with an array and a value. The function checks if all
 * of the array values have the given value.
 */
export const arrAll = (arr: Array<number>, val: number) => {

  for (const i in arr) {
    if (arr[i] !== val) {
      return false
    }
  }
  return true
}

/**
 * The function is called with an array of integers. Each can have a max value.
 * The function computes a percentage string from the values. 100% means that
 * all entries have the max value.
 */
export const arrPercentage = (arr: Array<number>, max: number) => {
  let sum = 0

  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]
  }

  return percentage(sum, arr.length * max)
}

/**
 * The function returns a percentage for a fraction of a total value.
 */
export const percentage = (num: number, total: number) => {
  //
  // Prevent NaN
  //
  if (!total) {
    return 0
  }
  const result = (num * 100) / total
  return Math.round(result)
}

/**
 * The function returns a random number between min and max. Both are included
 * and it is assumed that both parameters are integers.
 */
const getRandomIntInclusive = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * The function shuffles an array in place.
 */
export const shuffleArr = (arr: Array<object>) => {

  for (let i = 0; i < arr.length; i++) {
    //
    // Get a random index of the array
    //
    const j = getRandomIntInclusive(0, arr.length - 1)

    //
    // Ensure that there is something to do
    //
    if (i === j) {
      continue
    }

    //
    // Swap i and j
    //
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
}

/**
 * The function creates a toogling function, which toogles two string values 
 * after 'repeat' calls.
 */
export const createRepeatToggle = (repeat: number, first: string, second: string) => {
  let count = 0

  return () => {
    return (count++ % (2 * repeat) < repeat) ? first : second
  }
}

/**
 * This function is used in catch clauses, because everything can be thrown.
 */
export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return String(error)
}

/**
 * The function ensures that the value is between min and max.
 */
export function ensureMinMax(value: number, min: number, max: number) {
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return value
}