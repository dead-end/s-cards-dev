import { db } from './db';

/**
 * The function gets the last modified date of the topics file from the config
 * store.
 *
 * @param {IDBDatabase} db The Database.
 * @returns A Promise for the last modified date.
 */
export const dbcGetLastModified = () => {
  return new Promise((resolve, reject) => {
    db
      .transaction(['config'], 'readonly')
      .objectStore('config')
      .get('topics-last-modified').onsuccess = (e) => {
      const prop = e.target.result;

      //
      // It is possible that no date exists in the store.
      //
      if (prop) {
        resolve(prop.value);
      } else {
        resolve();
      }
    };
  });
};

/**
 * The function stores the last modified date for the topics file in the config
 * store.
 *
 * @param {Date} lastModified The last modified date of the topics file.
 */
export const dbcSetLastModified = (lastModified) => {
  const data = { key: 'topics-last-modified', value: lastModified };
  const store = db.transaction(['config'], 'readwrite').objectStore('config');

  store.put(data).onsuccess = () => {
    console.log('Store:', store.name, ' set lastModified:', data);
  };
};
