import { arrGetProps, arrToMap } from './utils';

/**
 * The function reads the last modified date from the topics store for a given
 * file.
 *
 * @param {IDBDatabase} db The Database.
 * @param {String} file Name of the file, which is the id.
 * @returns A Promise.
 */
export const dbtGetLastModified = (db, file) => {
  return new Promise((resolve, reject) => {
    //
    // Create a transaction for the topics store.
    //
    const store = db.transaction(['topics'], 'readonly').objectStore('topics');

    store.get(file).onsuccess = (e) => {
      //
      // Get the topic object from the store. It is possible that the value is
      // undefined.
      //
      const lastModified = e.target.result.lastModified;
      console.log('Store:', store.name, ' get lastModified:', lastModified);
      resolve(lastModified);
    };
  });
};

/**
 * The function stores the last modified date of a topic file in the topic
 * store.
 *
 * @param {IDBTransaction} tx
 * @param {String} file
 * @param {Date} lastModified
 */
export const dbtSetLastModified = (tx, file, lastModified) => {
  const store = tx.objectStore('topics');
  store.get(file).onsuccess = (e) => {
    //
    // Get the topic from the store and set the last modified date.
    //
    const topic = e.target.result;
    topic.lastModified = lastModified;

    //
    // Write the updated tpic to the store.
    //
    store.put(topic).onsuccess = () => {
      console.log('Store:', store.name, ' set lastModified:', topic);
    };
  };
};

/**
 * The function is called with a json array that contains the topics. It
 * deletes all topics from the store, that are not contained in the json and
 * updates the rest.
 *
 * @param {IDBDatabase} db The Database.
 * @param {Array} json
 */
export const dbtSync = (db, json) => {
  const store = db.transaction(['topics'], 'readwrite').objectStore('topics');

  store.getAll().onsuccess = (e) => {
    //
    // Create a map with the topics and the file as the key.
    //
    const storeMap = arrToMap(e.target.result, 'file');

    //
    // Get an array with the files from the json array. The file is the key for
    // the topics in the store and has to be unique.
    //
    const jsonKeys = arrGetProps(json, 'file');

    //
    // Delete the topics from the store that are not in the json array.
    //
    for (let storeKey in storeMap) {
      if (!jsonKeys.includes(storeKey)) {
        store.delete(storeKey).onsuccess = () => {
          console.log('Store:', store.name, ' deleted:', storeKey);
        };
      }
    }

    //
    // Update the topics in the store.
    //
    json.forEach((jsonItem) => {
      //
      // Copy last modified if present.
      //
      const storeItem = storeMap.get(jsonItem.file);
      if (storeItem && storeItem.lastModified) {
        jsonItem.lastModified = storeItem.lastModified;
      }

      store.put(jsonItem).onsuccess = (e) => {
        console.log('Store:', store.name, ' update:', e.target.result);
      };
    });
  };
};
