// TODO: TS OK => remove TODO
import { db } from './db';

/**
 * The config collection contains key value pairs.
 */
export interface Config {
  key: string,
  value: any
}

/**
 * The function reads a Config from the store.
 */
export const dbcGetConfig = (key: string) => {

  return new Promise<void | Config>((resolve, reject) => {

    const request = db
      .transaction(['config'], 'readonly')
      .objectStore('config')
      .get(key);

    request.onsuccess = (e) => {
      //
      // Get the value from the store. It is possible that no date exists in
      // the store.
      //
      resolve(request.result as Config);
    };
  });
};

/**
 * The function persists a Config in the store.
 */
export const dbcSetConfig = (config: Config) => {

  const store = db.transaction(['config'], 'readwrite').objectStore('config');

  store.put(config).onsuccess = () => {
    console.log('Store:', store.name, 'config key:', config.key, 'value:', config.value);
  };
};