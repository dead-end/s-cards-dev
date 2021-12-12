// TODO: TS OK => remove TODO
import { db } from './db';

/**
 * The config collection contains key value pairs.
 */
interface Config {
  key: string,
  value: any
}

/**
 * The function gets the last modified date of the topics file from the config
 * store.
 */
export const dbcGetLastModified = () => {

  return new Promise<void | Date>((resolve, reject) => {

    const request = db
      .transaction(['config'], 'readonly')
      .objectStore('config')
      .get('topics-last-modified');

    request.onsuccess = (e) => {
      //
      // Get the value from the store
      //
      const prop: Config = request.result;
      //
      // It is possible that no date exists in the store.
      //
      if (prop) {
        resolve(prop.value as Date);
      } else {
        resolve();
      }
    };
  });
};

/**
 * The function stores the last modified date for the topics file in the config
 * store.
 */
export const dbcSetLastModified = (lastModified: Date) => {

  const data: Config = { key: 'topics-last-modified', value: lastModified };
  const store = db.transaction(['config'], 'readwrite').objectStore('config');

  store.put(data).onsuccess = () => {
    console.log('Store:', store.name, 'set lastModified:', data);
  };
};
