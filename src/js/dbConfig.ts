import { db } from './db'

// TODO: not used
/**
 * The config collection contains key value pairs.
 */
export interface Config<T> {
  key: string,
  value: T
}

/**
 * The function reads a Config from the store, which may not exist.
 */
// TODO: not used
export const dbcGetConfig = <T>(key: string) => {

  return new Promise<void | Config<T>>((resolve, reject) => {

    const store = db
      .transaction(['config'], 'readonly')
      .objectStore('config')

    const request = store.get(key)
    request.onsuccess = (e) => {
      //
      // Get the value from the store. It is possible that no date exists in
      // the store.
      //
      const config: Config<T> = request.result
      if (config) {
        console.log('Store:', store.name, 'get config key:', config.key, 'value:', config.value)
      } else {
        console.log('Store:', store.name, 'get config key:', key, 'not defined:')
      }

      resolve(config)
    }
  })
}

/**
 * The function persists a Config in the store.
 */
// TODO: not used
export const dbcSetConfig = <T>(config: Config<T>) => {

  const store = db.transaction(['config'], 'readwrite').objectStore('config')

  store.put(config).onsuccess = () => {
    console.log('Store:', store.name, 'set config key:', config.key, 'value:', config.value)
  }
}